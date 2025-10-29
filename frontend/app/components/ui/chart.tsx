'use client'

import * as React from 'react'
import * as Recharts from 'recharts'
import { cn } from '@/app/lib/utils'

/* ----------------------------- Types ----------------------------- */

const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)
function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error('useChart must be used within a <ChartContainer />')
  return ctx
}

/** Recharts Tooltip payload에서 실사용하는 최소 안전 타입 */
type TooltipItem = {
   value?: number | string
  name?: string
  dataKey?: string | number
  color?: string
  payload?: Record<string, unknown>
}

/** Recharts Legend payload에서 실사용하는 최소 안전 타입 */
type LegendItem = {
  value?: string
  dataKey?: string | number
  color?: string
  payload?: Record<string, unknown>
}

/* --------------------------- Container --------------------------- */

type ChartContainerProps = React.ComponentProps<'div'> & {
  id?: string
  config: ChartConfig
  children: React.ReactNode
}

function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {/* TS가 children 타입을 좁게 보기도 해서 안전 캐스팅 */}
        <Recharts.ResponsiveContainer>{children as React.ReactElement}</Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

/* ----------------------------- Style ----------------------------- */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, v]) => v.theme || v.color)
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, v]) => {
    const color = v.theme?.[theme as keyof typeof v.theme] || v.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  )
}

/* ---------------------------- Tooltip ---------------------------- */

const ChartTooltip = Recharts.Tooltip

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean
  payload?: ReadonlyArray<TooltipItem>
  label?: unknown
  labelFormatter?: (label: unknown, payload?: ReadonlyArray<TooltipItem>) => React.ReactNode
  /** Recharts formatter 시그니처: (value, name, item, index) */
  formatter?: (value: number | string, name: string, item: TooltipItem, index: number) => React.ReactNode
  indicator?: 'line' | 'dot' | 'dashed'
  hideLabel?: boolean
  hideIndicator?: boolean
  color?: string
  nameKey?: string
  labelKey?: string
  labelClassName?: string
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  ...divProps
}: TooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)

    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
    }
    return value ? <div className={cn('font-medium', labelClassName)}>{value}</div> : null
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null
  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
      {...divProps}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
      {payload.map((item, index) => {
  const key = `${nameKey || item.name || item.dataKey || 'value'}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)

  // 색상 추출 (any 금지)
  let indicatorColor = color
  if (!indicatorColor) {
    const fill = item.payload?.['fill']
    if (typeof fill === 'string') indicatorColor = fill
    else if (typeof item.color === 'string') indicatorColor = item.color
  }

  return (
    <div
      key={String(item.dataKey ?? index)}
      className={cn(
        '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
        indicator === 'dot' && 'items-center'
      )}
    >
      {formatter &&
      item.value !== undefined &&
      (typeof item.value === 'number' || typeof item.value === 'string') ? (
        // Recharts formatter: (value, name, item, index)
        formatter(item.value, String(item.name ?? ''), item, index)
      ) : (
        <>
          {!hideIndicator && (
            <div
              className={cn('shrink-0 rounded-[2px]', {
                'h-2.5 w-2.5': indicator === 'dot',
                'w-1': indicator === 'line',
                'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                'my-0.5': payload.length === 1 && indicator !== 'dot',
              })}
              style={
                {
                  backgroundColor: indicator === 'dot' ? indicatorColor : undefined,
                  borderColor: indicatorColor,
                } as React.CSSProperties
              }
            />
          )}
          <div className={cn('flex flex-1 justify-between leading-none', payload.length === 1 && indicator !== 'dot' ? 'items-end' : 'items-center')}>
            <div className="grid gap-1.5">
              <span className="text-muted-foreground">
                {itemConfig?.label ?? item.name}
              </span>
            </div>
            {item.value != null && (
              <span className="text-foreground font-mono font-medium tabular-nums">
                {typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
})}

      </div>
    </div>
  )
}

/* ----------------------------- Legend ---------------------------- */

const ChartLegend = Recharts.Legend

type LegendContentProps = React.HTMLAttributes<HTMLDivElement> & {
  verticalAlign?: 'top' | 'middle' | 'bottom'
  hideIcon?: boolean
  nameKey?: string
  payload?: LegendItem[]
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: LegendContentProps) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}>
      {payload.map((item, i) => {
  const key = `${nameKey || item.dataKey || 'value'}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)

  return (
    <div
      key={String(item.dataKey ?? item.value ?? i)}
      className={cn('[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3')}
    >
      {!hideIcon ? (
        <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
      ) : null}
      {itemConfig?.label ?? item.value}
    </div>
  )
})}
    </div>
  )
}

/* ---------------------------- Utilities -------------------------- */

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: { payload?: Record<string, unknown> } & Record<string, unknown>,
  key: string
) {
  // 직접 키가 문자열이면 우선
  const direct = payload[key]
  if (typeof direct === 'string') {
    return config[direct] ?? config[key]
  }

  // 내부 payload 객체에서 찾기
  const inner = payload.payload
  if (inner && typeof inner[key] === 'string') {
    const k = inner[key] as string
    return config[k] ?? config[key]
  }

  // 기본
  return config[key]
}


export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }
