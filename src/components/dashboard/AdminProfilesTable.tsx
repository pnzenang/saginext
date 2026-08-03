'use client'

import { useId, useMemo, useState } from 'react'

import { Building2, Mail, Phone, SearchIcon, XIcon } from 'lucide-react'

import RemoveAssociationProfileButton from '@/components/dashboard/RemoveAssociationProfileButton'
import PaginationControls from '@/components/global/PaginationControls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'

export type AdminProfileRow = {
  associationCode: string
  associationName: string
  createdAtLabel: string
  firstDelegateEmail: string
  firstDelegateFullName: string
  firstDelegatePhoneNumber: string
  id: string
  secondDelegateEmail: string
  secondDelegateFullName: string
  secondDelegatePhoneNumber: string
  thirdDelegateEmail: string
  thirdDelegateFullName: string
  thirdDelegatePhoneNumber: string
}

type AdminProfilesTableProps = {
  profiles: AdminProfileRow[]
}

const defaultProfileRowsPerPage = 10
const profileRowsPerPageOptions = [10, 25, 50, 100]

const getSearchableProfileText = (profile: AdminProfileRow) =>
  [
    profile.associationName,
    profile.associationCode,
    profile.firstDelegateFullName,
    profile.firstDelegateEmail,
    profile.firstDelegatePhoneNumber,
    profile.secondDelegateFullName,
    profile.secondDelegateEmail,
    profile.secondDelegatePhoneNumber,
    profile.thirdDelegateFullName,
    profile.thirdDelegateEmail,
    profile.thirdDelegatePhoneNumber,
    profile.createdAtLabel
  ]
    .join(' ')
    .toLowerCase()

const filterProfiles = (profiles: AdminProfileRow[], searchQuery: string) => {
  const searchTerms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)

  if (searchTerms.length === 0) return profiles

  return profiles.filter(profile => {
    const searchableText = getSearchableProfileText(profile)

    return searchTerms.every(term => searchableText.includes(term))
  })
}

const getDelegateContactTitle = ({ email, name, phone }: { email: string; name: string; phone: string }) =>
  [name, email, phone].filter(Boolean).join(' - ')

const AdminProfilesTable = ({ profiles }: AdminProfilesTableProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(defaultProfileRowsPerPage)
  const searchInputId = useId()
  const rowsPerPageSelectId = useId()

  const filteredProfiles = useMemo(() => filterProfiles(profiles, searchQuery), [profiles, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / rowsPerPage))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedProfiles = useMemo(() => {
    const startIndex = (activePage - 1) * rowsPerPage

    return filteredProfiles.slice(startIndex, startIndex + rowsPerPage)
  }, [activePage, filteredProfiles, rowsPerPage])

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSearchChange = (nextSearchQuery: string) => {
    setSearchQuery(nextSearchQuery)
    setCurrentPage(1)
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <Card className='rounded-lg shadow-none'>
      <CardContent className='p-0'>
        {profiles.length > 0 ? (
          <>
            <div className='flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between'>
              <form
                role='search'
                className='w-full max-w-md'
                onSubmit={event => {
                  event.preventDefault()
                }}
              >
                <label htmlFor={searchInputId} className='sr-only'>
                  Search delegate profiles
                </label>
                <div className='relative'>
                  <Input
                    id={searchInputId}
                    type='text'
                    value={searchQuery}
                    onChange={event => handleSearchChange(event.target.value)}
                    placeholder='Search association, code, delegate, email, or phone'
                    className='pr-9 pl-9'
                  />
                  <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3'>
                    <SearchIcon className='size-4' aria-hidden='true' />
                  </div>
                  {searchQuery ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-xs'
                      className='text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full'
                      onClick={() => handleSearchChange('')}
                      aria-label='Clear delegate profile search'
                    >
                      <XIcon className='size-3.5' />
                    </Button>
                  ) : null}
                </div>
              </form>
              <div className='flex items-center justify-between gap-2 sm:justify-start'>
                <label
                  htmlFor={rowsPerPageSelectId}
                  className='text-muted-foreground text-sm font-medium whitespace-nowrap'
                >
                  Rows
                </label>
                <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger id={rowsPerPageSelectId} size='sm' className='w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align='end'>
                    {profileRowsPerPageOptions.map(option => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='hidden overflow-hidden md:block'>
              <Table className='min-w-0 table-fixed text-xs lg:text-sm'>
                <colgroup>
                  <col className='w-[18%]' />
                  <col className='w-[9%]' />
                  <col className='w-[17%]' />
                  <col className='w-[17%]' />
                  <col className='w-[17%]' />
                  <col className='w-[10%]' />
                  <col className='w-[12%]' />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead title='Association' className='truncate px-1.5'>
                      Association
                    </TableHead>
                    <TableHead title='Code' className='truncate px-1.5'>
                      Code
                    </TableHead>
                    <TableHead title='Primary Delegate' className='truncate px-1.5'>
                      Primary Delegate
                    </TableHead>
                    <TableHead title='Second Delegate' className='truncate px-1.5'>
                      Second Delegate
                    </TableHead>
                    <TableHead title='Board Member' className='truncate px-1.5'>
                      Board Member
                    </TableHead>
                    <TableHead title='Created' className='truncate px-1.5'>
                      Created
                    </TableHead>
                    <TableHead title='Action' className='truncate px-1.5'>
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProfiles.length > 0 ? (
                    paginatedProfiles.map(profile => (
                      <TableRow key={profile.id}>
                        <TableCell title={profile.associationName} className='min-w-0 px-1.5'>
                          <div className='min-w-0 space-y-1'>
                            <p className='truncate font-medium'>{profile.associationName}</p>
                          </div>
                        </TableCell>
                        <TableCell title={profile.associationCode} className='min-w-0 px-1.5'>
                          <Badge variant='outline' className='w-full max-w-full justify-start rounded-md font-mono'>
                            <span className='min-w-0 truncate'>{profile.associationCode}</span>
                          </Badge>
                        </TableCell>
                        <TableCell
                          title={getDelegateContactTitle({
                            email: profile.firstDelegateEmail,
                            name: profile.firstDelegateFullName,
                            phone: profile.firstDelegatePhoneNumber
                          })}
                          className='min-w-0 px-1.5'
                        >
                          <DelegateContact
                            email={profile.firstDelegateEmail}
                            name={profile.firstDelegateFullName}
                            phone={profile.firstDelegatePhoneNumber}
                          />
                        </TableCell>
                        <TableCell
                          title={getDelegateContactTitle({
                            email: profile.secondDelegateEmail,
                            name: profile.secondDelegateFullName,
                            phone: profile.secondDelegatePhoneNumber
                          })}
                          className='min-w-0 px-1.5'
                        >
                          <DelegateContact
                            email={profile.secondDelegateEmail}
                            name={profile.secondDelegateFullName}
                            phone={profile.secondDelegatePhoneNumber}
                          />
                        </TableCell>
                        <TableCell
                          title={getDelegateContactTitle({
                            email: profile.thirdDelegateEmail,
                            name: profile.thirdDelegateFullName,
                            phone: profile.thirdDelegatePhoneNumber
                          })}
                          className='min-w-0 px-1.5'
                        >
                          <DelegateContact
                            email={profile.thirdDelegateEmail}
                            name={profile.thirdDelegateFullName}
                            phone={profile.thirdDelegatePhoneNumber}
                          />
                        </TableCell>
                        <TableCell title={profile.createdAtLabel} className='min-w-0 px-1.5'>
                          <span className='block truncate'>{profile.createdAtLabel}</span>
                        </TableCell>
                        <TableCell className='px-1.5'>
                          <RemoveAssociationProfileButton
                            associationCode={profile.associationCode}
                            associationName={profile.associationName}
                            profileId={profile.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className='text-muted-foreground h-24 text-center'>
                        No profiles found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='grid gap-3 p-3 md:hidden'>
              {paginatedProfiles.length > 0 ? (
                paginatedProfiles.map(profile => (
                  <article key={profile.id} className='bg-background rounded-lg border p-4 shadow-sm'>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <div className='flex flex-wrap items-start justify-between gap-2'>
                          <h2 className='text-lg font-semibold'>{profile.associationName}</h2>
                          <Badge variant='outline' className='rounded-md font-mono'>
                            {profile.associationCode}
                          </Badge>
                        </div>
                        <p className='text-muted-foreground text-xs'>Created {profile.createdAtLabel}</p>
                      </div>
                      <div className='space-y-3'>
                        <MobileDelegateContact
                          email={profile.firstDelegateEmail}
                          label='Primary Delegate'
                          name={profile.firstDelegateFullName}
                          phone={profile.firstDelegatePhoneNumber}
                        />
                        <MobileDelegateContact
                          email={profile.secondDelegateEmail}
                          label='Second Delegate'
                          name={profile.secondDelegateFullName}
                          phone={profile.secondDelegatePhoneNumber}
                        />
                        <MobileDelegateContact
                          email={profile.thirdDelegateEmail}
                          label='Board Member'
                          name={profile.thirdDelegateFullName}
                          phone={profile.thirdDelegatePhoneNumber}
                        />
                      </div>
                      <RemoveAssociationProfileButton
                        associationCode={profile.associationCode}
                        associationName={profile.associationName}
                        profileId={profile.id}
                      />
                    </div>
                  </article>
                ))
              ) : (
                <div className='text-muted-foreground rounded-md border px-4 py-10 text-center text-sm'>
                  No profiles found.
                </div>
              )}
            </div>

            {filteredProfiles.length > 0 ? (
              <div className='flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row'>
                <p className='text-muted-foreground text-sm' aria-live='polite'>
                  Showing {(activePage - 1) * rowsPerPage + 1}-
                  {Math.min(activePage * rowsPerPage, filteredProfiles.length)} of {filteredProfiles.length}
                </p>
                {totalPages > 1 ? (
                  <PaginationControls
                    activePage={activePage}
                    canNext={activePage < totalPages}
                    canPrevious={activePage > 1}
                    getPageButtonClassName={isActive =>
                      isActive
                        ? undefined
                        : 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                    }
                    iconClassName='text-primary'
                    labelClassName='text-primary max-sm:hidden'
                    onNext={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                    onPageChange={setCurrentPage}
                    onPrevious={() => setCurrentPage(Math.max(1, activePage - 1))}
                    pages={pages}
                    showLeftEllipsis={showLeftEllipsis}
                    showRightEllipsis={showRightEllipsis}
                  />
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className='flex min-h-72 items-center justify-center p-6 text-center'>
            <div className='max-w-md space-y-2'>
              <Building2 className='text-muted-foreground mx-auto size-10' aria-hidden='true' />
              <h2 className='text-xl font-semibold'>No profiles collected yet.</h2>
              <p className='text-muted-foreground leading-7'>
                Profiles will appear here after delegates create their association profile.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DelegateContact({ email, name, phone }: { email: string; name: string; phone: string }) {
  return (
    <div className='min-w-0 space-y-1'>
      <p className='truncate font-medium'>{name}</p>
      <a className='text-primary block truncate text-sm hover:underline' href={`mailto:${email}`}>
        {email}
      </a>
      <a className='text-muted-foreground block truncate text-sm hover:underline' href={`tel:${phone}`}>
        {phone}
      </a>
    </div>
  )
}

function MobileDelegateContact({
  email,
  label,
  name,
  phone
}: {
  email: string
  label: string
  name: string
  phone: string
}) {
  return (
    <div className='rounded-lg border p-3'>
      <p className='text-muted-foreground mb-1 text-xs font-medium uppercase'>{label}</p>
      <p className='font-medium'>{name}</p>
      <div className='mt-2 space-y-1'>
        <a className='text-primary flex items-center gap-2 text-sm hover:underline' href={`mailto:${email}`}>
          <Mail className='size-4 shrink-0' aria-hidden='true' />
          <span className='break-all'>{email}</span>
        </a>
        <a className='text-muted-foreground flex items-center gap-2 text-sm hover:underline' href={`tel:${phone}`}>
          <Phone className='size-4 shrink-0' aria-hidden='true' />
          <span>{phone}</span>
        </a>
      </div>
    </div>
  )
}

export default AdminProfilesTable
