
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Search, Link as LinkIcon, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDocs, collection, query, orderBy, limit, startAfter, where, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 50;

interface Handle {
    id: string;
    fullName: string;
    email: string;
    handle: string;
    status: 'Active' | 'Suspended';
}

export default function AdminHandleLinksPage() {
  const [handles, setHandles] = useState<Handle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]); // stack of page cursors
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = async (cursor?: QueryDocumentSnapshot<DocumentData>) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'users'),
        where('handle', '>', ''),        // Only users with a handle set
        orderBy('handle'),
        limit(PAGE_SIZE + 1)             // Fetch 1 extra to detect if next page exists
      );
      if (cursor) q = query(q, startAfter(cursor));

      const snap = await getDocs(q);
      const docs = snap.docs.slice(0, PAGE_SIZE);
      setHasMore(snap.docs.length > PAGE_SIZE);

      const fetchedHandles: Handle[] = docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.fullName || 'Unknown',
          email: data.email || '',
          handle: data.handle,
          status: data.status || 'Active',
        };
      });

      setHandles(fetchedHandles);
      if (docs.length > 0) {
        // Save the last document of this page as the cursor for the next page
        setCursors(prev => {
          const updated = [...prev];
          updated[currentPage] = docs[docs.length - 1];
          return updated;
        });
      }
    } catch (err) {
      console.error('Error fetching handles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextPage = () => {
    const cursor = cursors[currentPage];
    if (!cursor) return;
    setCurrentPage(p => p + 1);
    fetchPage(cursor);
  };

  const handlePrevPage = () => {
    if (currentPage === 0) return;
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchPage(prevPage === 0 ? undefined : cursors[prevPage - 1]);
  };

  const filteredHandles = useMemo(() => {
    if (!searchTerm) return handles;
    const lower = searchTerm.toLowerCase();
    return handles.filter(h =>
      h.fullName.toLowerCase().includes(lower) ||
      h.email.toLowerCase().includes(lower) ||
      h.handle.toLowerCase().includes(lower)
    );
  }, [handles, searchTerm]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2"><LinkIcon className="h-6 w-6" /> Handle Links</CardTitle>
              <CardDescription>Monitor all merchant handle links. Showing {PAGE_SIZE} per page (server-paginated).</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or handle..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Handle Link</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {[1,2,3].map(j => <TableCell key={j}><Skeleton className="h-10 w-full" /></TableCell>)}
                    </TableRow>
                  ))
                : filteredHandles.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        {searchTerm ? 'No handles match your search.' : 'No merchant handles configured yet.'}
                      </TableCell>
                    </TableRow>
                  )
                : filteredHandles.map(handle => (
                    <TableRow key={handle.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/dashboard/users/${handle.id}`} className="font-medium hover:underline">{handle.fullName}</Link>
                        <div className="text-sm text-muted-foreground">{handle.email}</div>
                      </TableCell>
                      <TableCell>
                        <a href={`/pay/${handle.handle}`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary hover:underline flex items-center gap-1">
                          /{handle.handle}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant={handle.status === 'Active' ? 'default' : 'secondary'}>
                          {handle.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-muted-foreground">
              Page {currentPage + 1} · {handles.length} handles loaded (server-paginated, {PAGE_SIZE}/page)
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 0 || loading}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!hasMore || loading}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
