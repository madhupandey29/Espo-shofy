'use client';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const useSearchFormSubmit = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");

  // Sync search text with URL query parameter
  useEffect(() => {
    const query = searchParams.get('q') || searchParams.get('searchText') || '';
    if (query && query !== searchText) {
      setSearchText(query);
    } else if (!query && searchText) {
      // Clear search text if URL doesn't have it
      setSearchText('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchText && searchText.trim()) {
      // Always redirect to shop page with search query
      const trimmedSearch = searchText.trim();
      let route = `/shop?q=${encodeURIComponent(trimmedSearch)}`;

      if (category && category !== "Select Category") {
        route += `&productType=${encodeURIComponent(category)}`;
        setCategory("");
      }

      // If already on shop page, just update the query param
      if (pathname === '/shop') {
        router.push(route);
      } else {
        // If on any other page, navigate to shop page
        router.push(route);
      }
    } else {
      // If no search text, go to shop page or home
      if (pathname !== '/shop') {
        router.push(`/shop`);
      }
      setCategory("");
    }
  };

  const handleClear = () => {
    setSearchText("");
    setCategory("");
    // Remove search query from URL
    if (pathname === '/shop') {
      router.push('/shop');
    } else {
      router.push('/shop');
    }
  };

  return {
    searchText,
    category,
    setSearchText,
    setCategory,
    handleSubmit,
    handleClear,
  };
};

export default useSearchFormSubmit;
