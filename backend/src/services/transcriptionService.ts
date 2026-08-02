import { Meeting } from '../models/Meeting.js';
import { Mom } from '../models/Mom.js';
import { Decision } from '../models/Decision.js';
import { Task } from '../models/Task.js';
import { Deadline } from '../models/Deadline.js';
import { EffectivenessScore } from '../models/EffectivenessScore.js';
import {
  transcribeAudio,
  generateMom,
  extractDecisions,
  extractActionItems,
  extractDeadlines,
  getMeetingInsights,
  matchSkill,
  scoreEffectiveness,
} from '../integrations/ai/aiClient.js';

export const processAudioTranscription = async (
  meetingId: string,
  fileBuffer: Buffer,
  mimetype: string
): Promise<void> => {
  await Meeting.findByIdAndUpdate(meetingId, {
    processingStatus: 'processing',
  });

  try {
    const { transcript } = await transcribeAudio(fileBuffer, mimetype);

    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { transcript, processingStatus: 'completed' },
      { new: true, returnDocument: 'after' }
    ).populate<{
      participants: {
        _id: string;
        name: string;
        email: string;
        skills: string[];
      }[];
    }>('participants', 'name email skills');

    if (!meeting) return;

    const participants = meeting.participants as {
      _id: string;
      name: string;
      email: string;
      skills: string[];
    }[];

    // ── Phase 1: all independent extractions in parallel ────────────────────
    const [
      momResult,
      decisionsResult,
      actionItemsResult,
      deadlinesResult,
      insightsResult,
    ] = await Promise.allSettled([
      generateMom(transcript, meeting.title),
      extractDecisions(transcript),
      extractActionItems(transcript),
      extractDeadlines(transcript),
      getMeetingInsights(transcript, {}),
    ]);

    // Persist MoM
    if (momResult.status === 'fulfilled') {
      const { agenda, discussionPoints, summary } = momResult.value;
      await Mom.findOneAndUpdate(
        { meetingId },
        { meetingId, agenda, discussionPoints, summary },
        { upsert: true, returnDocument: 'after' }
      );
    } else {
      console.error(`[MoM] meetingId=${meetingId}`, momResult.reason);
    }

    // Persist Decisions
    if (decisionsResult.status === 'fulfilled') {
      const { decisions } = decisionsResult.value;
      await Decision.deleteMany({ meetingId });
      if (decisions.length > 0) {
        await Decision.insertMany(decisions.map((d) => ({ ...d, meetingId })));
      }
    } else {
      console.error(
        `[Decisions] meetingId=${meetingId}`,
        decisionsResult.reason
      );
    }

    // Persist Deadlines
    if (deadlinesResult.status === 'fulfilled') {
      const { deadlines } = deadlinesResult.value;
      await Deadline.deleteMany({ meetingId });
      if (deadlines.length > 0) {
        await Deadline.insertMany(
          deadlines.map((d) => ({
            meetingId,
            description: d.description,
            assignee: d.assignee,
            deadline: new Date(d.deadline),
            rawText: d.rawText,
          }))
        );
      }
    } else {
      console.error(
        `[Deadlines] meetingId=${meetingId}`,
        deadlinesResult.reason
      );
    }

    // ── Phase 2: per-action-item skill-match (concurrent) ───────────────────
    if (actionItemsResult.status === 'fulfilled') {
      const { actionItems } = actionItemsResult.value;

      const skillResults = await Promise.allSettled(
        actionItems.map((item) =>
          matchSkill(item.task, item.assignee, participants)
        )
      );

      await Task.deleteMany({ meetingId });

      const taskDocs = actionItems.map((item, i) => {
        const skillResult = skillResults[i];
        const skillData =
          skillResult.status === 'fulfilled' ? skillResult.value : null;

        if (skillResult.status === 'rejected') {
          console.error(`[SkillMatch] task="${item.task}"`, skillResult.reason);
        }

        let matchedUserId: string | undefined;
        if (skillData?.matchedUserId) {
          const matched = participants.find(
            (p) => p._id.toString() === skillData.matchedUserId
          );
          matchedUserId = matched?._id.toString();
        }

        return {
          meetingId,
          assignee: item.assignee,
          task: item.task,
          dueDate: item.dueDate,
          requiredSkills: skillData?.requiredSkills ?? [],
          matchedUserId,
          status: 'draft' as const,
          // Pass source_span through untouched for FE Explainable-AI panel
          ...(item.source_span ? { sourceSpan: item.source_span } : {}),
        };
      });

      if (taskDocs.length > 0) {
        await Task.insertMany(taskDocs);
      }
    } else {
      console.error(
        `[ActionItems] meetingId=${meetingId}`,
        actionItemsResult.reason
      );
    }

    // ── Phase 3: effectiveness score — needs decisions + keyPoints + talkTime ─
    const decisions =
      decisionsResult.status === 'fulfilled'
        ? decisionsResult.value.decisions
        : [];
    const keyPoints =
      momResult.status === 'fulfilled' ? momResult.value.agenda : [];
    const talkTime =
      insightsResult.status === 'fulfilled'
        ? insightsResult.value.insights.map((i) => ({
            speaker: i.speaker,
            talkTimeSeconds: i.talkTimeSeconds,
            talkTimePercent: i.talkTimePercent,
          }))
        : [];

    if (insightsResult.status === 'rejected') {
      console.error(`[Insights] meetingId=${meetingId}`, insightsResult.reason);
    }

    try {
      const scoreData = await scoreEffectiveness({
        decisions,
        keyPoints,
        talkTime,
      });
      await EffectivenessScore.findOneAndUpdate(
        { meetingId },
        { meetingId, ...scoreData },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      console.error(`[EffectivenessScore] meetingId=${meetingId}`, err);
    }
  } catch (err) {
    await Meeting.findByIdAndUpdate(meetingId, { processingStatus: 'failed' });
    throw err;
  }
};
