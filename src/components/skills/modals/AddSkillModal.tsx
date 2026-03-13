import { memo, useMemo } from 'react'
import type { TFunction } from 'i18next'
import type { FeaturedSkillDto, ToolOption, ToolStatusDto } from '../types'

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
  onExploreFilterChange: (value: string) => void
  onSelectFeaturedSkill: (sourceUrl: string) => void
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
  onExploreFilterChange,
  onSelectFeaturedSkill,
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
                {t('exploreSource')}{' '}
                <a
                  href="https://clawhub.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  clawhub.ai
                </a>
              </div>
              {featuredLoading ? (
                <div className="explore-loading">{t('exploreLoading')}</div>
              ) : filteredSkills.length === 0 ? (
                <div className="explore-empty">{t('exploreEmpty')}</div>
              ) : (
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
