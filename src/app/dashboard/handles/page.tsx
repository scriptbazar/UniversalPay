
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Search, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Handle {
    id: string;
    fullName: string;
    email: string;
    handle: string;
    totalPayments: number;
    totalVolume: number;
    status: 'Active' | 'Suspended';
}

export default function AdminHandleLinksPage() {
  const [handles, setHandles] = useState<Handle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedHandles: Handle[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // In a real app, totalPayments and totalVolume would be aggregated fields.
            fetchedHandles.push({ 
                id: doc.id, 
                fullName: data.fullName,
                email: data.email,
                handle: data.handle || '',
                status: data.status || 'Active',
                totalPayments: Math.floor(Math.random() * 100), // Placeholder
                totalVolume: Math.random() * 5000, // Placeholder
            });
        });
        setHandles(fetchedHandles);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredHandles = useMemo(() => {
    return handles.filter(handle => 
        handle.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handle.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handle.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [handles, searchTerm]);

  const totalPages = Math.ceil(filteredHandles.length / itemsPerPage);
  const paginatedHandles = filteredHandles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><LinkIcon className="h-6 w-6" /> Handle Links</CardTitle>
                <CardDescription>Monitor all merchant handle links and their performance.</CardDescription>
            </div>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name, email, or handle..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <TableHead>Total Payments</TableHead>
                <TableHead>Total Volume</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">Loading handles...</TableCell>
                </TableRow>
              ) : paginatedHandles.map((handle) => (
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
                  <TableCell>{handle.totalPayments}</TableCell>
                  <TableCell>${handle.totalVolume.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={handle.status === 'Active' ? 'default' : 'secondary'}>
                      {handle.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
               {!loading && filteredHandles.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No handles found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <div className="flex justify-between items-center w-full">
                <div className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
