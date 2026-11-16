'use client'

import { useMemo, useState, useTransition } from 'react'

import { AlertTriangle, CheckCircle2, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export type AdminPaymentCodeRow = {
  associationCode: string
  associationName: string
  codeCents: number | null
  vestedMembers: number
}

type SaveAction = (formData: FormData) => Promise<{ message: string } | void>

type AdminPaymentCodesTableProps = {
  rows: AdminPaymentCodeRow[]
  saveAction: SaveAction
}

const formatCodeCents = (codeCents: number | null) => (codeCents === null ? '' : (codeCents / 100).toFixed(2))

const getInputId = (associationCode: string) => `payment-code-${associationCode}`

const focusPaymentCodeInput = (associationCode: string) => {
  const input = document.getElementById(getInputId(associationCode))

  if (!(input instanceof HTMLInputElement)) return

  input.scrollIntoView({ behavior: 'smooth', block: 'center' })
  input.focus({ preventScroll: true })
}

const PaymentCodeRowForm = ({ row, saveAction }: { row: AdminPaymentCodeRow; saveAction: SaveAction }) => {
  const [isPending, startTransition] = useTransition()
  const isMissing = row.codeCents === null

  const handleSubmit = (formData: FormData) => {
    const enteredCode = String(formData.get('paymentCode') ?? '').trim()

    startTransition(async () => {
      const result = await saveAction(formData)

      if (result?.message) {
        toast.error(result.message)

        return
      }

      toast.success(
        enteredCode ? `${row.associationCode} cents code saved.` : `${row.associationCode} cents code cleared.`
      )
    })
  }

  return (
    <form action={handleSubmit} className='flex items-center justify-end gap-2'>
      <input type='hidden' name='associationCode' value={row.associationCode} />
      <label htmlFor={getInputId(row.associationCode)} className='sr-only'>
        Cents code for {row.associationCode}
      </label>
      <Input
        id={getInputId(row.associationCode)}
        name='paymentCode'
        type='text'
        inputMode='decimal'
        defaultValue={formatCodeCents(row.codeCents)}
        placeholder={isMissing ? 'Add code' : '0.00'}
        aria-invalid={isMissing && row.vestedMembers > 0 ? true : undefined}
        className={`h-8 w-24 text-right tabular-nums ${isMissing ? 'border-amber-500 placeholder:text-amber-600' : ''}`}
      />
      <Button type='submit' size='sm' variant={isMissing ? 'default' : 'outline'} disabled={isPending}>
        <CheckCircle2 className='size-3.5' />
        {isPending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  )
}

const AdminPaymentCodesTable = ({ rows, saveAction }: AdminPaymentCodesTableProps) => {
  const [search, setSearch] = useState('')
  const [showMissingOnly, setShowMissingOnly] = useState(false)

  const missingRows = useMemo(() => rows.filter(row => row.codeCents === null), [rows])
  const missingWithVestedMembers = useMemo(() => missingRows.filter(row => row.vestedMembers > 0), [missingRows])

  const visibleRows = useMemo(() => {
    const query = search.trim().toUpperCase()

    return rows.filter(row => {
      if (showMissingOnly && row.codeCents !== null) return false
      if (!query) return true

      return row.associationCode.includes(query) || row.associationName.toUpperCase().includes(query)
    })
  }, [rows, search, showMissingOnly])

  return (
    <div className='space-y-4'>
      {missingWithVestedMembers.length > 0 ? (
        <div
          role='alert'
          className='flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200'
        >
          <AlertTriangle className='mt-0.5 size-5 shrink-0' aria-hidden='true' />
          <div className='space-y-2'>
            <p className='font-medium'>
              {missingWithVestedMembers.length === 1
                ? '1 association with vested members has no cents code. Please add one.'
                : `${missingWithVestedMembers.length} associations with vested members have no cents code. Please add one for each.`}
            </p>
            <div className='flex flex-wrap gap-2'>
              {missingWithVestedMembers.map(row => (
                <Button
                  key={row.associationCode}
                  type='button'
                  size='xs'
                  variant='outline'
                  className='border-amber-500/50 bg-transparent'
                  onClick={() => {
                    setSearch('')
                    setShowMissingOnly(true)
                    requestAnimationFrame(() => focusPaymentCodeInput(row.associationCode))
                  }}
                >
                  {row.associationCode}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300'>
          <CheckCircle2 className='size-5 shrink-0' aria-hidden='true' />
          Every association with vested members has a cents code.
        </div>
      )}

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full sm:max-w-xs'>
          <Search
            className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2'
            aria-hidden='true'
          />
          <Input
            type='search'
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder='Search code or association'
            aria-label='Search code or association'
            className='pl-8'
          />
        </div>
        <div className='flex gap-2'>
          <Button
            type='button'
            size='sm'
            variant={showMissingOnly ? 'outline' : 'default'}
            onClick={() => setShowMissingOnly(false)}
          >
            All ({rows.length})
          </Button>
          <Button
            type='button'
            size='sm'
            variant={showMissingOnly ? 'default' : 'outline'}
            onClick={() => setShowMissingOnly(true)}
          >
            Missing ({missingRows.length})
          </Button>
        </div>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20'>Code</TableHead>
              <TableHead>Association</TableHead>
              <TableHead className='w-20 text-right'>Vested</TableHead>
              <TableHead className='w-52 text-right'>Cents code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-muted-foreground py-8 text-center'>
                  {showMissingOnly ? 'No missing cents codes.' : 'No association matches your search.'}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map(row => (
                <TableRow
                  key={`${row.associationCode}-${row.codeCents ?? 'none'}`}
                  className={row.codeCents === null ? 'bg-amber-500/5' : undefined}
                >
                  <TableCell className='font-semibold'>
                    <div className='flex items-center gap-2'>
                      {row.associationCode}
                      {row.codeCents === null ? (
                        <Badge variant='outline' className='border-amber-500/50 text-amber-700 dark:text-amber-300'>
                          Missing
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-64 truncate'>{row.associationName || '—'}</TableCell>
                  <TableCell className='text-right tabular-nums'>{row.vestedMembers.toLocaleString('en-US')}</TableCell>
                  <TableCell>
                    <PaymentCodeRowForm row={row} saveAction={saveAction} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AdminPaymentCodesTable
