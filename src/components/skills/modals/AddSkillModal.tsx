import { memo, useMemo } from 'react'
import type { TFunction } from 'i18next'
import type { FeaturedSkillDto, OnlineSkillDto, ToolOption, ToolStatusDto } from '../types'

type AddSkillModalProps = {
  open: boolean
  loading: boolean
  canClose: boolean
  addModalTab: 'local' | 'git' | 'explore'
  localPath: string
  localName: string
  gitUrl: string
  gitName: string
  syncTargets: Record<string, boolean>
  installedTools: ToolOption[]
  toolStatus: ToolStatusDto | null
  featuredSkills: FeaturedSkillDto[]
  featuredLoading: boolean
  exploreFilter: string
  searchResults: OnlineSkillDto[]
  searchLoading: boolean
  onExploreFilterChange: (value: string) => void
  onSelectFeaturedSkill: (sourceUrl: string) => void
  onSelectSearchResult: (sourceUrl: string, skillName: string) => void
  onRequestClose: () => void
  onTabChange: (tab: 'local' | 'git' | 'explore') => void
  onLocalPathChange: (value: string) => void
  onPickLocalPath: () => void
  onLocalNameChange: (value: string) => void
  onGitUrlChange: (value: string) => void
  onGitNameChange: (value: string) => void
  onSyncTargetChange: (toolId: string, checked: boolean) => void
  onSubmit: () => void
  t: TFunction
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

const AddSkillModal = ({
  open,
  loading,
  canClose,
  addModalTab,
  localPath,
  localName,
  gitUrl,
  gitName,
  syncTargets,
  installedTools,
  toolStatus,
  featuredSkills,
  featuredLoading,
  exploreFilter,
  searchResults,
  searchLoading,
  onExploreFilterChange,
  onSelectFeaturedSkill,
  onSelectSearchResult,
  onRequestClose,
  onTabChange,
  onLocalPathChange,
  onPickLocalPath,
  onLocalNameChange,
  onGitUrlChange,
  onGitNameChange,
  onSyncTargetChange,
  onSubmit,
  t,
}: AddSkillModalProps) => {
  const filteredSkills = useMemo(() => {
    if (!exploreFilter.trim()) return featuredSkills
    const lower = exploreFilter.toLowerCase()
    return featuredSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.summary.toLowerCase().includes(lower),
    )
  }, [featuredSkills, exploreFilter])

  const deduplicatedResults = useMemo(() => {
    const featuredNames = new Set(filteredSkills.map((s) => s.name.toLowerCase()))
    return searchResults.filter((s) => !featuredNames.has(s.name.toLowerCase()))
  }, [searchResults, filteredSkills])

  const isSearchActive = exploreFilter.trim().length >= 2

  if (!open) return null

  const isExplore = addModalTab === 'explore'

  return (
    <div
      className="modal-backdrop"
      onClick={() => (canClose ? onRequestClose() : null)}
    >
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{t('addSkillTitle')}</div>
          <button
            className="modal-close"
            type="button"
            onClick={onRequestClose}
            aria-label={t('close')}
            disabled={!canClose}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab-item${addModalTab === 'explore' ? ' active' : ''}`}
              type="button"
              onClick={() => onTabChange('explore')}
            >
              {t('exploreTab')}
            </button>
            <button
              className={`tab-item${addModalTab === 'local' ? ' active' : ''}`}
              type="button"
              onClick={() => onTabChange('local')}
            >
              {t('localTab')}
            </button>
            <button
              className={`tab-item${addModalTab === 'git' ? ' active' : ''}`}
              type="button"
              onClick={() => onTabChange('git')}
            >
              {t('gitTab')}
            </button>
          </div>

          {addModalTab === 'explore' ? (
            <div className="explore-content">
              <input
                className="input explore-filter"
                placeholder={t('exploreFilterPlaceholder')}
                value={exploreFilter}
                onChange={(e) => onExploreFilterChange(e.target.value)}
              />
              <div className="explore-source">
                {t('exploreSource')} clawhub.ai
              </div>

              {/* Section 1: Featured (local filter) */}
              {featuredLoading ? (
                <div className="explore-loading">{t('exploreLoading')}</div>
              ) : filteredSkills.length > 0 ? (
                <>
                  {isSearchActive && (
                    <div className="explore-section-title">{t('exploreFeaturedTitle')}</div>
                  )}
                  <div className="explore-list">
                    {filteredSkills.map((skill) => (
                      <div
                        key={skill.slug}
                        className="explore-skill-item"
                        onClick={() => onSelectFeaturedSkill(skill.source_url)}
                      >
                        <div className="explore-skill-header">
                          <span className="explore-skill-name">{skill.name}</span>
                          <span className="explore-skill-stats">
                            <span title="Downloads">{formatCount(skill.downloads)}</span>
                            {' / '}
                            <span title="Stars">{formatCount(skill.stars)}</span>
                          </span>
                        </div>
                        <div className="explore-skill-summary">{skill.summary}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {/* Section 2: Online search (only when >= 2 chars) */}
              {isSearchActive && (
                <>
                  <div className="explore-section-title">{t('exploreOnlineTitle')}</div>
                  {searchLoading ? (
                    <div className="explore-loading">{t('searchLoading')}</div>
                  ) : deduplicatedResults.length > 0 ? (
                    <div className="explore-list">
                      {deduplicatedResults.map((skill) => (
                        <div
                          key={skill.source}
                          className="explore-skill-item"
                          onClick={() => onSelectSearchResult(skill.source_url, skill.name)}
                        >
                          <div className="explore-skill-header">
                            <span className="explore-skill-name">{skill.name}</span>
                            <span className="explore-skill-stats">
                              {formatCount(skill.installs)} installs
                            </span>
                          </div>
                          <div className="explore-skill-source">{skill.source}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="explore-empty">{t('searchEmpty')}</div>
                  )}
                </>
              )}

              {/* Global empty state */}
              {!featuredLoading && filteredSkills.length === 0 &&
               !isSearchActive && (
                <div className="explore-empty">{t('exploreEmpty')}</div>
              )}
            </div>
          ) : addModalTab === 'local' ? (
            <>
              <div className="form-group">
                <label className="label">{t('localFolder')}</label>
                <div className="input-row">
                  <input
                    className="input"
                    placeholder={t('localPathPlaceholder')}
                    value={localPath}
                    onChange={(event) => onLocalPathChange(event.target.value)}
                  />
                  <button
                    className="btn btn-secondary input-action"
                    type="button"
                    onClick={onPickLocalPath}
                    disabled={!canClose}
                  >
                    {t('browse')}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="label">{t('optionalNamePlaceholder')}</label>
                <input
                  className="input"
                  placeholder={t('optionalNamePlaceholder')}
                  value={localName}
                  onChange={(event) => onLocalNameChange(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="label">{t('repositoryUrl')}</label>
                <input
                  className="input"
                  placeholder={t('gitUrlPlaceholder')}
                  value={gitUrl}
                  onChange={(event) => onGitUrlChange(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label">{t('optionalNamePlaceholder')}</label>
                <input
                  className="input"
                  placeholder={t('optionalNamePlaceholder')}
                  value={gitName}
                  onChange={(event) => onGitNameChange(event.target.value)}
                />
              </div>
            </>
          )}

          {!isExplore && (
            <div className="form-group">
              <label className="label">{t('installToTools')}</label>
              {toolStatus ? (
                <div className="tool-matrix">
                  {installedTools.map((tool) => (
                    <label
                      key={tool.id}
                      className={`tool-pill-toggle${
                        syncTargets[tool.id] ? ' active' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(syncTargets[tool.id])}
                        onChange={(event) =>
                          onSyncTargetChange(tool.id, event.target.checked)
                        }
                      />
                      {syncTargets[tool.id] ? <span className="status-badge" /> : null}
                      {tool.label}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="helper-text">{t('detectingTools')}</div>
              )}
              <div className="helper-text">{t('syncAfterCreate')}</div>
            </div>
          )}
        </div>
        {!isExplore && (
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onRequestClose}
              disabled={!canClose}
            >
              {t('cancel')}
            </button>
            <button
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={loading}
            >
              {addModalTab === 'local' ? t('create') : t('install')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(AddSkillModal)
