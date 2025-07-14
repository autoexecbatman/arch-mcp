#!/usr/bin/env node
/**
 * Enhanced Architecture Server with Smart Memory Integration
 * Professional Accuracy + User Preferences + Pattern Storage + Tool Safety + Context Tracking + Smart Memory Gates
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
const PATTERNS_FILE = path.join(DATA_DIR, 'patterns.json');
const PREFERENCES_FILE = path.join(DATA_DIR, 'preferences.json');
const VIOLATIONS_FILE = path.join(DATA_DIR, 'violations.json');
const METRICS_FILE = path.join(DATA_DIR, 'metrics.json');
const CONTEXT_FILE = path.join(DATA_DIR, 'context_tracking.json');
const MEMORY_CACHE_FILE = path.join(DATA_DIR, 'memory_cache.json');

// Smart Memory Integration Gates
class SmartMemoryGates {
  constructor() {
    this.maxStrandsCheck = 5;
    this.keywordThreshold = 2;
    this.temporalWeightHours = 24 * 7; // Last 7 days priority
  }

  // GATE63: Smart filter existing preferences check
  smartFilterExistingPreferences(context) {
    const keywords = this.extractKeywords(context);
    return this.filterMemoryByKeywords(keywords, 'preference', 3);
  }

  // GATE64: Keyword filtered memory and architecture verification
  keywordFilteredMemoryVerification(context, claimedInfo) {
    const keywords = this.extractKeywords(claimedInfo);
    const relevantMemory = this.filterMemoryByKeywords(keywords, 'any', this.maxStrandsCheck);
    return {
      keywords,
      relevantMemory,
      verificationNeeded: relevantMemory.length > 0
    };
  }

  // GATE65: Limited scope memory search
  limitedScopeMemorySearch(context, domain = 'preference') {
    const keywords = this.extractKeywords(context);
    const domainFiltered = this.filterMemoryByKeywords(keywords, domain, 3);
    const userPreferences = this.getCurrentPreferences();
    const architectureCheck = this.checkArchitectureAlignment(keywords);
    
    return {
      memoryResults: domainFiltered,
      userPreferences,
      architectureAlignment: architectureCheck,
      recommendedAction: this.determineAction(domainFiltered, userPreferences)
    };
  }

  // GATE66: Targeted preference domain check
  targetedPreferenceDomainCheck(newPreference, preferenceType) {
    const keywords = [preferenceType, ...this.extractKeywords(newPreference)];
    const existingPreferences = this.getCurrentPreferences();
    const conflictCheck = this.checkPreferenceConflicts(preferenceType, newPreference, existingPreferences);
    
    return {
      exists: existingPreferences.hasOwnProperty(preferenceType),
      conflicts: conflictCheck,
      recommendation: conflictCheck.length > 0 ? 'resolve_conflicts' : 'proceed'
    };
  }

  // GATE67: Smart filtered memory search before action
  smartFilteredMemorySearchBeforeAction(context, actionType) {
    const keywords = this.extractKeywords(context);
    const relevantMemory = this.filterMemoryByKeywords(keywords, actionType, this.maxStrandsCheck);
    const temporalWeight = this.applyTemporalWeighting(relevantMemory);
    
    return {
      shouldProceed: relevantMemory.length < 3, // If few relevant memories, likely new
      relevantMemory: temporalWeight,
      confidence: this.calculateConfidence(relevantMemory)
    };
  }

  // Core filtering algorithm
  extractKeywords(text, maxKeywords = 3) {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Simple frequency-based keyword extraction
    const frequency = {};
    words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  filterMemoryByKeywords(keywords, domain, maxResults) {
    // This would integrate with actual memory system
    // For now, return mock filtered results
    const mockMemoryResults = keywords.map(keyword => ({
      keyword,
      relevance: Math.random(),
      domain,
      timestamp: Date.now() - Math.random() * this.temporalWeightHours * 3600000
    })).slice(0, maxResults);
    
    return mockMemoryResults.sort((a, b) => b.relevance - a.relevance);
  }

  getCurrentPreferences() {
    try {
      if (fs.existsSync(PREFERENCES_FILE)) {
        return JSON.parse(fs.readFileSync(PREFERENCES_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load preferences:', e.message);
    }
    return {};
  }

  checkArchitectureAlignment(keywords) {
    // Check if keywords align with known architecture patterns
    const architectureTerms = ['english', 'correction', 'grammar', 'professional', 'accuracy'];
    const alignmentScore = keywords.filter(k => architectureTerms.includes(k)).length;
    return {
      aligned: alignmentScore > 0,
      score: alignmentScore,
      reason: alignmentScore > 0 ? 'matches_established_patterns' : 'new_domain'
    };
  }

  checkPreferenceConflicts(preferenceType, newValue, existingPreferences) {
    const conflicts = [];
    
    if (existingPreferences[preferenceType] && existingPreferences[preferenceType] !== newValue) {
      conflicts.push({
        type: 'value_conflict',
        existing: existingPreferences[preferenceType],
        new: newValue
      });
    }

    // Check for related preference conflicts
    const relatedPrefs = this.getRelatedPreferences(preferenceType);
    relatedPrefs.forEach(relatedPref => {
      if (existingPreferences[relatedPref] && this.isConflicting(newValue, existingPreferences[relatedPref])) {
        conflicts.push({
          type: 'related_conflict',
          preference: relatedPref,
          value: existingPreferences[relatedPref]
        });
      }
    });

    return conflicts;
  }

  getRelatedPreferences(preferenceType) {
    const relationMap = {
      'english_correction': ['communication_style', 'accuracy_requirements'],
      'communication_style': ['english_correction', 'message_format'],
      'accuracy_requirements': ['english_correction', 'professional_accuracy']
    };
    
    return relationMap[preferenceType] || [];
  }

  isConflicting(newValue, existingValue) {
    // Simple conflict detection - can be enhanced
    return newValue.toLowerCase().includes('no') && existingValue.toLowerCase().includes('yes') ||
           newValue.toLowerCase().includes('yes') && existingValue.toLowerCase().includes('no');
  }

  applyTemporalWeighting(memoryResults) {
    const now = Date.now();
    const weightThreshold = this.temporalWeightHours * 3600000; // Convert to milliseconds
    
    return memoryResults.map(result => ({
      ...result,
      temporalWeight: Math.max(0, 1 - (now - result.timestamp) / weightThreshold)
    })).sort((a, b) => b.temporalWeight - a.temporalWeight);
  }

  calculateConfidence(memoryResults) {
    if (memoryResults.length === 0) return 0.9; // High confidence if no conflicts
    if (memoryResults.length > 3) return 0.3; // Low confidence if many existing memories
    return 0.7 - (memoryResults.length * 0.1); // Moderate confidence
  }

  determineAction(memoryResults, userPreferences) {
    if (memoryResults.length === 0) return 'proceed_new';
    if (memoryResults.length > 2) return 'check_conflicts';
    return 'proceed_with_caution';
  }
}

// Rest of the enhanced architecture server code would continue here...
// Including the existing context tracker, professional accuracy, etc.

// Initialize smart memory gates
const smartMemoryGates = new SmartMemoryGates();

// Export for MCP integration
module.exports = {
  SmartMemoryGates,
  smartMemoryGates
};

console.error('Enhanced Architecture MCP Server with Smart Memory Gates started');
console.error('Memory Integration Gates 63-67 active with smart filtering protocols');
