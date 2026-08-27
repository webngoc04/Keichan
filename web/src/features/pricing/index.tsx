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
import { ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { Button } from '@/components/ui/button'

import {
  LoadingSkeleton,
  EmptyState,
  SearchBar,
  PricingTable,
  PricingSidebar,
  PricingToolbar,
  ModelCardGrid,
  ModelDetailsDrawer,
  PricingPlans,
  PricingComparison,
  PricingFAQ,
  ContactEnterpriseDialog,
} from './components'
import { EXCLUDED_GROUPS, VIEW_MODES } from './constants'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t } = useTranslation()
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    null
  )
  const [enterpriseDialogOpen, setEnterpriseDialogOpen] = useState(false)
  const [showModelExplorer, setShowModelExplorer] = useState(false)

  const {
    models,
    vendors,
    groupRatio,
    usableGroup,
    endpointMap,
    autoGroups,
    isLoading,
    priceRate,
    usdExchangeRate,
  } = usePricingData()

  const {
    searchInput,
    sortBy,
    vendorFilter,
    groupFilter,
    quotaTypeFilter,
    endpointTypeFilter,
    tagFilter,
    tokenUnit,
    viewMode,
    showRechargePrice,
    setSearchInput,
    setSortBy,
    setVendorFilter,
    setGroupFilter,
    setQuotaTypeFilter,
    setEndpointTypeFilter,
    setTagFilter,
    setTokenUnit,
    setViewMode,
    setShowRechargePrice,
    filteredModels,
    hasActiveFilters,
    activeFilterCount,
    availableTags,
    clearFilters,
    clearSearch,
  } = useFilters(models || [])

  const handleModelClick = useCallback((modelName: string) => {
    setSelectedModelName(modelName)
  }, [])

  const selectedModel = useMemo(
    () =>
      selectedModelName
        ? (models || []).find(
            (model) => model.model_name === selectedModelName
          ) || null
        : null,
    [models, selectedModelName]
  )

  const availableGroups = useMemo(
    () =>
      Object.keys(usableGroup || {}).filter(
        (g) => !EXCLUDED_GROUPS.includes(g)
      ),
    [usableGroup]
  )

  const handleClearAll = useCallback(() => {
    clearFilters()
    clearSearch()
  }, [clearFilters, clearSearch])

  const renderPricingContent = () => {
    if (filteredModels.length === 0) {
      return (
        <EmptyState
          searchQuery={searchInput}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAll}
        />
      )
    }

    if (viewMode === VIEW_MODES.CARD) {
      return (
        <ModelCardGrid
          models={filteredModels}
          onModelClick={handleModelClick}
          priceRate={priceRate}
          usdExchangeRate={usdExchangeRate}
          tokenUnit={tokenUnit}
          showRechargePrice={showRechargePrice}
          selectedGroup={groupFilter}
        />
      )
    }

    return (
      <PricingTable
        models={filteredModels}
        priceRate={priceRate}
        usdExchangeRate={usdExchangeRate}
        tokenUnit={tokenUnit}
        showRechargePrice={showRechargePrice}
        selectedGroup={groupFilter}
        onModelClick={handleModelClick}
      />
    )
  }

  if (isLoading) {
    return (
      <PublicLayout showMainContainer={false}>
        <div className='mx-auto w-full max-w-[1400px] px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10'>
          <LoadingSkeleton viewMode={viewMode} />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-25 dark:opacity-[0.12]'
          style={{
            background: [
              'radial-gradient(ellipse 60% 50% at 20% 20%, oklch(0.72 0.18 250 / 80%) 0%, transparent 70%)',
              'radial-gradient(ellipse 50% 40% at 80% 15%, oklch(0.65 0.15 200 / 60%) 0%, transparent 70%)',
              'radial-gradient(ellipse 40% 35% at 50% 70%, oklch(0.70 0.12 280 / 40%) 0%, transparent 70%)',
            ].join(', '),
            maskImage:
              'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 40%, transparent 100%)',
          }}
        />

        <PageTransition className='relative mx-auto w-full max-w-[1220px] px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8'>
          {/* Header */}
          <header className='mx-auto mb-12 max-w-3xl pt-4 text-center sm:mb-16 sm:pt-8'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
              <Sparkles className='size-3 animate-pulse' />
              <span>// {t('PRICING TIERS & CAPACITIES')}</span>
            </div>
            <h1 className='text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.12] font-bold tracking-tight'>
              {t('Simple, predictable pricing')}
            </h1>
            <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto'>
              {t(
                'Start free for development and testing, pay as you go for production workloads, or get dedicated enterprise SLA and custom routing.'
              )}
            </p>
          </header>

          {/* 3 Tier Pricing Cards */}
          <section className='mb-16 sm:mb-24'>
            <PricingPlans
              onContactEnterprise={() => setEnterpriseDialogOpen(true)}
            />
          </section>

          {/* Feature Matrix / Comparison Table */}
          <section className='mb-16 sm:mb-24 space-y-6'>
            <div className='text-center max-w-2xl mx-auto'>
              <h2 className='text-fluid-h2 font-bold tracking-tight'>
                {t('Compare Plan Features')}
              </h2>
              <p className='text-muted-foreground mt-2 text-xs sm:text-sm'>
                {t(
                  'Detailed breakdown of rate limits, model access, and support across all tiers.'
                )}
              </p>
            </div>
            <PricingComparison />
          </section>

          {/* Model Square / Per-token Rates Explorer Accordion/Toggle */}
          <section className='mb-16 sm:mb-24'>
            <div className='border-border/60 bg-card/60 rounded-2xl border p-6 sm:p-8 backdrop-blur-xs'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Layers className='text-primary size-5' />
                    <h3 className='text-lg font-bold sm:text-xl'>
                      {t('Per-Token Model Rates')}
                    </h3>
                  </div>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    {t(
                      'Browse per-token ratios and billing rates for {{count}} supported AI models.',
                      { count: models?.length || 0 }
                    )}
                  </p>
                </div>
                <Button
                  variant='outline'
                  className='shrink-0 text-xs sm:text-sm'
                  onClick={() => setShowModelExplorer((prev) => !prev)}
                >
                  {showModelExplorer ? (
                    <>
                      {t('Hide Model Rates')}
                      <ChevronUp className='ml-2 size-4' />
                    </>
                  ) : (
                    <>
                      {t('Browse Model Rates')}
                      <ChevronDown className='ml-2 size-4' />
                    </>
                  )}
                </Button>
              </div>

              {showModelExplorer && (
                <div className='mt-8 pt-6 border-t border-border/40 space-y-6'>
                  <SearchBar
                    value={searchInput}
                    onChange={setSearchInput}
                    onClear={clearSearch}
                    placeholder={t(
                      'Search model name, provider, endpoint, or tag...'
                    )}
                    className='max-w-2xl mx-auto'
                  />

                  <div className='grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]'>
                    <PricingSidebar
                      quotaTypeFilter={quotaTypeFilter}
                      endpointTypeFilter={endpointTypeFilter}
                      vendorFilter={vendorFilter}
                      groupFilter={groupFilter}
                      tagFilter={tagFilter}
                      onQuotaTypeChange={setQuotaTypeFilter}
                      onEndpointTypeChange={setEndpointTypeFilter}
                      onVendorChange={setVendorFilter}
                      onGroupChange={setGroupFilter}
                      onTagChange={setTagFilter}
                      vendors={vendors || []}
                      groups={availableGroups}
                      groupRatios={groupRatio}
                      tags={availableTags}
                      models={models || []}
                      hasActiveFilters={hasActiveFilters}
                      onClearFilters={clearFilters}
                      className='hover-scrollbar sticky top-4 hidden max-h-[calc(100dvh-2rem)] self-start overflow-y-auto xl:block'
                    />

                    <main className='min-w-0 space-y-4'>
                      <PricingToolbar
                        filteredCount={filteredModels.length}
                        totalCount={models?.length}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        tokenUnit={tokenUnit}
                        onTokenUnitChange={setTokenUnit}
                        showRechargePrice={showRechargePrice}
                        onRechargePriceChange={setShowRechargePrice}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        quotaTypeFilter={quotaTypeFilter}
                        endpointTypeFilter={endpointTypeFilter}
                        vendorFilter={vendorFilter}
                        groupFilter={groupFilter}
                        tagFilter={tagFilter}
                        onQuotaTypeChange={setQuotaTypeFilter}
                        onEndpointTypeChange={setEndpointTypeFilter}
                        onVendorChange={setVendorFilter}
                        onGroupChange={setGroupFilter}
                        onTagChange={setTagFilter}
                        vendors={vendors || []}
                        groups={availableGroups}
                        groupRatios={groupRatio}
                        tags={availableTags}
                        models={models || []}
                        hasActiveFilters={hasActiveFilters}
                        activeFilterCount={activeFilterCount}
                        onClearFilters={clearFilters}
                      />

                      {renderPricingContent()}
                    </main>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* FAQ Section */}
          <section className='mb-12'>
            <PricingFAQ />
          </section>

          {/* Model Details Drawer (when a model is clicked in the explorer) */}
          {selectedModel && (
            <ModelDetailsDrawer
              open={Boolean(selectedModel)}
              onOpenChange={(open) => {
                if (!open) setSelectedModelName(null)
              }}
              model={selectedModel}
              groupRatio={groupRatio || {}}
              usableGroup={usableGroup || {}}
              endpointMap={
                (endpointMap as Record<
                  string,
                  { path?: string; method?: string }
                >) || {}
              }
              autoGroups={autoGroups || []}
              priceRate={priceRate ?? 1}
              usdExchangeRate={usdExchangeRate ?? 1}
              tokenUnit={tokenUnit}
              showRechargePrice={showRechargePrice}
            />
          )}

          {/* Enterprise Dialog */}
          <ContactEnterpriseDialog
            open={enterpriseDialogOpen}
            onOpenChange={setEnterpriseDialogOpen}
          />
        </PageTransition>
      </div>
    </PublicLayout>
  )
}
