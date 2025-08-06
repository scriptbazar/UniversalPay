
'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Copy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";


interface User {
    id: string;
    fullName?: string;
    email?: string;
    plan?: string;
    status?: string;
    avatar?: string;
    role?: string;
    country?: string; // Added for filtering
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Filtering and Searching State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const usersCollectionRef = collection(db, "users");
                // Query to only fetch users with the 'merchant' role
                const q = query(usersCollectionRef, where("role", "==", "merchant"));

                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    let userList: User[] = [];
                    querySnapshot.forEach((doc) => {
                        userList.push({ id: doc.id, ...doc.data() } as User);
                    });
                    setUsers(userList);
                    setLoading(false);
                }, (err: any) => {
                    console.error("Error fetching users from Firestore: ", err);
                    setError(`Failed to load users: ${err.message}`);
                    toast({
                        variant: "destructive",
                        title: "Failed to load users",
                        description: err.message,
                    });
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [toast]);
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = searchTerm === '' || 
                                  user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = roleFilter === 'all' || (user.role || 'merchant').toLowerCase() === roleFilter;

            const matchesStatus = statusFilter === 'all' || (user.status || 'Active').toLowerCase() === statusFilter;
            
            const matchesCountry = countryFilter === 'all' || user.country === countryFilter;

            return matchesSearch && matchesRole && matchesStatus && matchesCountry;
        });
    }, [users, searchTerm, roleFilter, statusFilter, countryFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );


    const handleRowClick = (user: User) => {
        router.push(`/dashboard/users/${user.id}`);
    };

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
        });
    };
    
    const getCountryCode = (countryName?: string) => {
        if (!countryName) return null;
        const country = countries.find(c => c.name === countryName);
        return country?.code.toLowerCase();
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8 text-muted-foreground">Loading users...</div>;
        }
        
        if (error) {
            return <div className="text-center p-8 text-destructive">{error}</div>;
        }

        if (users.length === 0) {
            return <div className="text-center p-8 text-muted-foreground">No merchants found in the database.</div>;
        }

        return (
            <>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Plan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                           <TableRow key={user.id} onClick={() => router.push(`/dashboard/users/${user.id}`)} className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="font-medium">
                                  <div className="flex items-center gap-3">
                                      <Image src={user.avatar || `https://placehold.co/40x40.png?text=${(user.fullName || 'U').charAt(0)}`} width={40} height={40} alt={user.fullName || 'User'} className="rounded-full" data-ai-hint="user avatar" />
                                      <div>
                                          <div className="flex items-center gap-2">
                                            {getCountryCode(user.country) && (
                                                <Image src={`https://flagcdn.com/w20/${getCountryCode(user.country)}.png`} width={20} height={15} alt={user.country!} data-ai-hint="country flag" />
                                            )}
                                            <span>{user.fullName || 'Unnamed User'}</span>
                                          </div>
                                          <div className="text-sm text-muted-foreground">{user.email}</div>
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell>
                                 <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role || 'Merchant'}</Badge>
                              </TableCell>
                              <TableCell>
                                 <Badge variant={user.status === 'Active' ? 'default' : 'outline'}>{user.status || 'Active'}</Badge>
                              </TableCell>
                               <TableCell>{user.plan || 'Free'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredUsers.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">No merchants match the current filters.</div>
                )}
            </>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>Users & Merchants</CardTitle>
                            <CardDescription>
                                Manage all merchants on the platform. Click a user to see details.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or email..."
                                    className="pl-8 w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                             <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="merchant">Merchant</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={countryFilter} onValueChange={setCountryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Countries</SelectItem>
                                    {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
                <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}. Total {filteredUsers.length} users.
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

            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Merchant Details</DialogTitle>
                        <DialogDescription>
                        Details for {selectedUser?.fullName || 'user'}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <Image src={selectedUser.avatar || `https://placehold.co/64x64.png?text=${(selectedUser.fullName || 'U').charAt(0)}`} alt={selectedUser.fullName || 'User'} width={64} height={64} className="rounded-full" data-ai-hint="user avatar" />
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedUser.fullName}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedUser.email || '', 'Email')} />
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Role</p>
                                    <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 'secondary'}>{selectedUser.role || 'Merchant'}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge variant={selectedUser.status === 'Active' ? 'default' : 'outline'}>{selectedUser.status || 'Active'}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Plan</p>
                                    <p className="font-semibold">{selectedUser.plan || 'Free'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Country</p>
                                    <p className="font-semibold">{selectedUser.country || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-between gap-2">
                         <Button variant="ghost" onClick={() => setSelectedUser(null)}>Close</Button>
                         {selectedUser && (
                            <Button asChild>
                                <Link href={`/dashboard/users/${selectedUser.id}`}>View Full Profile</Link>
                            </Button>
                         )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
