# Hardening Plan: Weeks 1-2 Code Paths

## Assessment

### Completed (Sprint 2-3)
- ✅ Decision extraction with confidence scoring
- ✅ Skill-match ranking with workload penalties  
- ✅ Effectiveness scoring pipeline
- ✅ Regression test suite (13 tests, all passing)
- ✅ GitHub Actions CI integration
- ✅ Live-caption prototype (standalone)
- ✅ Local embedding fallback for offline mode

### Stretch Goal Analysis
**Socket.io Live-Caption Integration** would require:
- Add Socket.io package to backend
- Create WebSocket server layer
- Handle audio chunk streaming and buffering
- Implement reconnection/error recovery
- Integration tests across WebSocket + AI service
- **Estimated effort: 8-12 hours**

**Hardening Decision:** Focus on stability and quality of existing paths given timeline.

---

## Hardening Checklist

### 1. Error Handling & Edge Cases

#### Decision Extraction
- [ ] Empty transcript handling
- [ ] Very long transcripts (>30min)
- [ ] Transcripts with no decision-like keywords
- [ ] Mixed language transcripts
- [ ] Verify character_start/character_end accuracy

#### Skill-Match
- [ ] Candidate with zero skills
- [ ] Workload_weight edge values (0.0 and 1.0)
- [ ] All candidates equally qualified
- [ ] No matching skills in candidate pool

#### Effectiveness Score
- [ ] Zero talk time across all speakers
- [ ] Single speaker only
- [ ] No decisions extracted
- [ ] Zero agenda items planned but some covered

### 2. Performance Optimization

#### Embedding Performance
- [ ] Benchmark local vs. real embeddings
- [ ] Cache query embeddings across calls
- [ ] Batch processing for skill embeddings
- [ ] Memory profile for 10-minute transcripts

#### Endpoint Timeouts
- [ ] Decision extraction: Should complete <3s for 10-min transcript
- [ ] Skill-match: Should complete <2s for 10 candidates
- [ ] Effectiveness score: Should complete <1s

### 3. API Contract Stability

#### Request/Response Validation
- [ ] All endpoints return consistent error shapes
- [ ] Confidence scores always 0.0-1.0
- [ ] Dates normalized consistently (ISO 8601)
- [ ] UUIDs always valid (or null)

#### Backward Compatibility
- [ ] No breaking changes to source_span schema
- [ ] Optional fields remain optional
- [ ] Decision ID format is stable (dec_*)
- [ ] Skill ID format is stable (skill_*)

### 4. Observability & Logging

#### Request Tracing
- [ ] Correlation IDs link request through pipeline
- [ ] Decision extraction logs include decision count
- [ ] Skill-match logs include top candidate name
- [ ] Effectiveness score logs include final score

#### Error Logging
- [ ] Validation errors are distinguishable from runtime errors
- [ ] Timeout events are logged with context
- [ ] Schema mismatches include the offending field
- [ ] Integration errors (e.g., missing meetingDate) are clear

### 5. Test Coverage

#### Additional Regression Tests
- [ ] Negative test: Invalid transcript schema
- [ ] Boundary test: Exactly max_decisions decisions
- [ ] Stress test: 100 candidates in skill-match
- [ ] Timeout test: Verify retry behavior
- [ ] Cross-pipeline test: Decisions → Skills → Effectiveness with real data

#### Fixture Expansion
- [ ] Fixture for "no decisions" scenario
- [ ] Fixture for multilingual meeting
- [ ] Fixture for adversarial skill names
- [ ] Fixture for timezone edge cases in deadline normalization

### 6. Documentation

#### API Documentation
- [ ] Swagger/OpenAPI schema is accurate and complete
- [ ] Response examples match actual outputs
- [ ] Error codes are documented
- [ ] Source span linking logic is explained

#### Developer Guides
- [ ] How to add a new decision extraction strategy
- [ ] How to tune skill-match weighting
- [ ] How to debug embedding mismatches
- [ ] Known limitations (e.g., relative date parsing)

#### Deployment Checklist
- [ ] Environment variables documented
- [ ] Local embedding flag documented
- [ ] Performance tuning recommendations
- [ ] Troubleshooting guide for common issues

---

## Implementation Priority

### Week 1 (High Priority)
1. Add error handling tests for edge cases
2. Optimize embedding cache behavior
3. Expand regression test fixtures (4-5 new scenarios)
4. Add correlation IDs to all AI service responses

### Week 2 (Medium Priority)
1. Performance benchmarking and optimization
2. Backward compatibility validation
3. Complete API documentation
4. Add stress tests (100+ candidates, 30+ min transcripts)

---

## Success Criteria

- [ ] All regression tests pass (currently 13/13)
- [ ] New edge-case tests pass (target: +5-8 tests)
- [ ] Decision extraction <3s for 10-min transcript
- [ ] Skill-match <2s for 10 candidates
- [ ] Zero breaking API changes
- [ ] All endpoints document their error responses
- [ ] Deployment runbook is complete and tested

---

## Future: Socket.io Live-Caption (Post-Sprint 3)

Once hardening is complete, Socket.io integration can proceed:

1. Add Socket.io to backend
2. Create `/live-caption` namespace
3. Implement audio chunk buffering + flow control
4. Connect to AI service live_caption_stream.py
5. Implement client reconnection + partial message recovery
6. Load testing for concurrent streams
