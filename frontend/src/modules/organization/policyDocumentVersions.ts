import type { PolicyDocument } from './types'

export type PolicyDocumentGroup = {
  rootId: number
  current: PolicyDocument
  history: PolicyDocument[]
}

// Bölüm 14.7/8I — `GET /api/documents` TÜM versiyonları DÜZ bir liste
// olarak döner, "bu doküman ailesi" kavramını backend TEMSİL ETMEZ; her
// versiyon yalnızca `previousVersionId` ile bir öncekine işaret eder
// (geriye doğru bağlı liste). Bu yüzden "doküman kimliği" istemci
// tarafında, zincir GERİYE doğru izlenip `previousVersionId === null`
// olan KÖK versiyona ulaşarak türetilir (`SurveyAnswerPage`'deki "listeden
// türet" AYNI kararın devamı).
export function groupPolicyDocumentVersions(documents: PolicyDocument[]): PolicyDocumentGroup[] {
  const byId = new Map(documents.map((document) => [document.id, document]))

  function rootIdOf(document: PolicyDocument): number {
    let current = document
    while (current.previousVersionId !== null) {
      const previous = byId.get(current.previousVersionId)
      if (!previous) {
        break
      }
      current = previous
    }
    return current.id
  }

  const versionsByRootId = new Map<number, PolicyDocument[]>()
  for (const document of documents) {
    const rootId = rootIdOf(document)
    const versions = versionsByRootId.get(rootId) ?? []
    versions.push(document)
    versionsByRootId.set(rootId, versions)
  }

  return [...versionsByRootId.entries()].map(([rootId, versions]) => {
    const sorted = [...versions].sort((a, b) => b.version - a.version)
    const current = sorted.find((version) => version.status === 'ACTIVE') ?? sorted[0]
    return { rootId, current, history: sorted.filter((version) => version.id !== current.id) }
  })
}
