import React from 'react';
import Wrapper from '@/layout/wrapper';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import UserProfile from '@/components/profile/UserProfile';

// Force SSR for profile for latest user info
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const runtime = 'edge';
export const preferredRegion = 'auto';

export default function ProfilePage() {
  return (
    <Wrapper>
      <HeaderTwo />
      <UserProfile />
      <Footer />
    </Wrapper>
  );
}
