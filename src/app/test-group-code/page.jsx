'use client';

import React from 'react';
import TestGroupCodeIntegration from '@/components/product-details/test-group-code-integration';
import HeaderTwo from '@/layout/headers/header-2';
import Wrapper from '@/layout/wrapper';

export default function TestGroupCodePage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <div style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <TestGroupCodeIntegration />
      </div>
    </Wrapper>
  );
}