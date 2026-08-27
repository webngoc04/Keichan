/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout, SectionPageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { listDeployments } from './api'
import { DeploymentAccessGuard } from './components/deployment-access-guard'
import { DeploymentsTable } from './components/deployments-table'
import { CreateDeploymentDrawer } from './components/dialogs/create-deployment-drawer'
import { ModelsDialogs } from './components/models-dialogs'
import { ModelsPrimaryButtons } from './components/models-primary-buttons'
import { ModelsProvider, useModels } from './components/models-provider'
import { ModelsTable } from './components/models-table'
import { useModelDeploymentSettings } from './hooks/use-model-deployment-settings'
import { deploymentsQueryKeys } from './lib'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'
import {
  type ModelsSectionId,
  MODELS_DEFAULT_SECTION,
  MODELS_SECTION_IDS,
} from './section-registry'

const SECTION_META: Record<ModelsSectionId, { titleKey: string }> = {
  metadata: {
    titleKey: 'Metadata',
  },
  deployments: {
    titleKey: 'Deployments',
  },
}

function ModelsContent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tabCategory, setTabCategory } = useModels()
  const params = useParams({ strict: false }) as { section?: string } | undefined
  const activeSection = (params?.section ??
    MODELS_DEFAULT_SECTION) as ModelsSectionId
  const role = useAuthStore((s) => s.auth.user?.role)
  const isAdmin = (role ?? 0) >= ROLE.ADMIN
  // Anonymous / regular users see a read-only model catalog. The
  // Deployments tab and management actions are admin-only.
  const visibleSections = MODELS_SECTION_IDS.filter(
    (s) => s !== 'deployments' || isAdmin
  )
  const resolvedSection =
    activeSection === 'deployments' && !isAdmin ? 'metadata' : activeSection

  // Deployment create dialog state
  const [createDeploymentOpen, setCreateDeploymentOpen] = useState(false)

  // keep context state in sync (for components that rely on it)
  useEffect(() => {
    if (tabCategory !== activeSection) {
      setTabCategory(activeSection)
    }
  }, [activeSection, setTabCategory, tabCategory])

  const handleSectionChange = useCallback(
    (section: string) => {
      void navigate({
        to: '/models/$section',
        params: { section: section as ModelsSectionId },
      })
    },
    [navigate]
  )

  const meta = SECTION_META[activeSection] ?? SECTION_META.metadata
  const pageTitle = isAdmin ? t(meta.titleKey) : t('Models')

  return (
    <PublicLayout showMainContainer={false}>
      <div className='mx-auto w-full max-w-[1440px] px-[clamp(1rem,0.5rem+2vw,2rem)] py-6 pt-20 min-h-[calc(100vh-280px)]'>
        <SectionPageLayout fixedContent={false}>
          <SectionPageLayout.Title>{pageTitle}</SectionPageLayout.Title>
          <SectionPageLayout.Actions>
            {isAdmin &&
              (activeSection === 'metadata' ? (
              <ModelsPrimaryButtons />
            ) : (
              <Button onClick={() => setCreateDeploymentOpen(true)} size='sm'>
                <Plus className='h-4 w-4' />
                {t('Create deployment')}
              </Button>
            ))}
          </SectionPageLayout.Actions>
          <SectionPageLayout.Content>
            {isAdmin ? (
              <div className='flex h-full min-h-0 flex-col gap-4'>
                <Tabs value={resolvedSection} onValueChange={handleSectionChange}>
                  <TabsList className='max-w-full flex-wrap justify-start group-data-horizontal/tabs:h-auto'>
                    {visibleSections.map((section) => (
                      <TabsTrigger key={section} value={section}>
                        {t(SECTION_META[section].titleKey)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className='min-h-0 flex-1'>
                  {resolvedSection === 'metadata' ? (
                    <ModelsTable />
                  ) : (
                    <DeploymentsSection />
                  )}
                </div>
              </div>
            ) : (
              <div className='h-full min-h-0'>
                <ModelsTable />
              </div>
            )}
          </SectionPageLayout.Content>
        </SectionPageLayout>
      </div>

      <ModelsDialogs />
      {isAdmin && (
        <CreateDeploymentDrawer
          open={createDeploymentOpen}
          onOpenChange={setCreateDeploymentOpen}
        />
      )}
    </PublicLayout>
  )
}

function DeploymentsSection() {
  const queryClient = useQueryClient()
  const {
    loading: deploymentLoading,
    loadingPhase,
    isIoNetEnabled,
    connectionLoading,
    connectionOk,
    connectionError,
    testConnection,
  } = useModelDeploymentSettings()

  // Prefetch deployments list while connection check is in progress.
  useEffect(() => {
    if (isIoNetEnabled && loadingPhase === 'connection') {
      const defaultParams = { p: 1, page_size: 10 }
      queryClient.prefetchQuery({
        queryKey: deploymentsQueryKeys.list(defaultParams),
        queryFn: () => listDeployments(defaultParams),
        staleTime: 30 * 1000,
      })
    }
  }, [isIoNetEnabled, loadingPhase, queryClient])

  return (
    <DeploymentAccessGuard
      loading={deploymentLoading}
      loadingPhase={loadingPhase}
      isEnabled={isIoNetEnabled}
      connectionLoading={connectionLoading}
      connectionOk={connectionOk}
      connectionError={connectionError}
      onRetry={testConnection}
    >
      <DeploymentsTable />
    </DeploymentAccessGuard>
  )
}

export function Models() {
  return (
    <ModelsProvider>
      <ModelsContent />
    </ModelsProvider>
  )
}
