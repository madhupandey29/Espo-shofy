'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { GridTab, ListTab } from '@/svg';
import GridItem from './grid-item';
import ListItem from './list-item';
import Pagination from '@/ui/Pagination';
import BlogSidebar from '../blog-postox/blog-sidebar';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/,'');
const BLOG_PATH = process.env.NEXT_PUBLIC_API_BLOG_PATH || '/blogs';

const fetchBlogs = async () => {
  const res = await fetch(`${API_BASE}${BLOG_PATH}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load blogs');
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
};

const BlogGridArea = ({ list_area = false }) => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currPage, setCurrPage] = useState(1);
  const [pageStart, setPageStart] = useState(0);
  const [countOfPage, setCountOfPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await fetchBlogs();
        if (!alive) return;
        setAllBlogs(data);
        setFilteredRows(data);
      } catch (e) {
        if (alive) setErr(e?.message || 'Error loading blogs');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const paginatedData = (items, startPage, pageCount) => {
    setFilteredRows(items);
    setPageStart(startPage);
    setCountOfPage(pageCount);
  };

  const pageSlice = useMemo(
    () => filteredRows.slice(pageStart, pageStart + countOfPage),
    [filteredRows, pageStart, countOfPage]
  );

  const showingFrom = filteredRows.length ? pageStart + 1 : 0;
  const showingTo = Math.min(pageStart + countOfPage, filteredRows.length);

  return (
    <section className="tp-blog-grid-area pb-20">
      <div className="container" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="tp-blog-grid-wrapper">
              <div className="tp-blog-grid-top d-flex justify-content-between mb-40">
                <div className="tp-blog-grid-result">
                  {loading ? (
                    <p>Loading…</p>
                  ) : err ? (
                    <p className="text-danger">{err}</p>
                  ) : (
                    <p>Showing {showingFrom}–{showingTo} of {filteredRows.length} results</p>
                  )}
                </div>

                <div className="tp-blog-grid-tab tp-tab">
                  <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                      <button
                        className={`nav-link ${list_area ? '' : 'active'}`}
                        id="nav-grid-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#nav-grid"
                        type="button"
                        role="tab"
                        aria-controls="nav-grid"
                        aria-selected={(!list_area).toString()}
                      >
                        <ListTab />
                      </button>
                      <button
                        className={`nav-link ${list_area ? 'active' : ''}`}
                        id="nav-list-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#nav-list"
                        type="button"
                        role="tab"
                        aria-controls="nav-list"
                        aria-selected={list_area.toString()}
                      >
                        <GridTab />
                      </button>
                    </div>
                  </nav>
                </div>
              </div>

              <div className="tab-content" id="nav-tabContent">
                <div
                  className={`tab-pane fade ${list_area ? '' : 'show active'}`}
                  id="nav-grid"
                  role="tabpanel"
                  aria-labelledby="nav-grid-tab"
                  tabIndex="0"
                >
                  <div className="tp-blog-grid-item-wrapper">
                    <div className="row tp-gx-30">
                      {pageSlice.map((blog, idx) => (
                        <div key={blog._id || idx} className="col-lg-6 col-md-6">
                          {/* pass index so first 2 images can be eager/priority */}
                          <GridItem blog={blog} index={idx} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`tab-pane fade ${list_area ? 'show active' : ''}`}
                  id="nav-list"
                  role="tabpanel"
                  aria-labelledby="nav-list-tab"
                  tabIndex="0"
                >
                  <div className="tp-blog-list-item-wrapper">
                    {pageSlice.map((blog, idx) => (
                      <ListItem key={blog._id || idx} blog={blog} index={idx} />
                    ))}
                  </div>
                </div>

                {!loading && !err && (
                  <div className="row">
                    <div className="col-xl-12">
                      <div className="tp-blog-pagination mt-30">
                        <div className="tp-pagination">
                          <Pagination
                            items={allBlogs}
                            countOfPage={6}
                            paginatedData={paginatedData}
                            currPage={currPage}
                            setCurrPage={setCurrPage}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-4">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogGridArea;
