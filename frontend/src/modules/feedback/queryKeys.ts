export const feedbackKeys = {
  surveys: {
    all: ['feedback', 'surveys'] as const,
    list: () => [...feedbackKeys.surveys.all, 'list'] as const,
    results: (surveyId: number) => [...feedbackKeys.surveys.all, surveyId, 'results'] as const,
  },
  suggestionCategories: {
    all: ['feedback', 'suggestionCategories'] as const,
    list: () => [...feedbackKeys.suggestionCategories.all, 'list'] as const,
  },
  suggestions: {
    all: ['feedback', 'suggestions'] as const,
    list: (employeeId?: number) => [...feedbackKeys.suggestions.all, employeeId ?? 'all'] as const,
  },
}
