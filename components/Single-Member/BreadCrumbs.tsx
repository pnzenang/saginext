import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

import React from 'react';

const BreadCrumbs = ({
  firstName,
  familyName,
}: {
  firstName: string;
  familyName: string;
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href='/' className='captalize text-lg'>
          home
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href='/allMembers' className='captalize text-lg'>
          allMembers
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage className='captalize text-lg'>
          {firstName} {familyName}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

export default BreadCrumbs;
