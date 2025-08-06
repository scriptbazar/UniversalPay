
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
import { useRouter, useParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Copy, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function UsersByCountryPage() {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const country = params.country as string;

    // Filtering and Searching State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const usersCollectionRef = collection(db, "users");
                // Fetch users from the specific country
                const q = query(usersCollectionRef, where("country", "==", decodeURIComponent(country)));
                
                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    let userList: User[] = [];
                    querySnapshot.forEach((doc) => {
                        userList.push({ id: doc.id, ...doc.data() } as User);
                    });
                    
                    setAllUsers(userList);
                    setLoading(false);
                }, (err: any) => {
                    console.error("Error fetching users from Firestore: ", err);
                    setError(`Failed to load users: ${err.message}`);
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [toast, country]);
    
    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            const matchesSearch = searchTerm === '' || 
                                  user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = roleFilter === 'all' || (user.role || 'merchant').toLowerCase() === roleFilter;
            
            const matchesStatus = statusFilter === 'all' || (user.status || 'Active').toLowerCase() === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [allUsers, searchTerm, roleFilter, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );


    const handleRowClick = (user: User) => {
        router.push(`/dashboard/users/${user.id}`);
    };
    
    const pageTitle = country ? `Merchants from ${decodeURIComponent(country)}` : "All Users";

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8 text-muted-foreground">Loading users...</div>;
        }
        
        if (error) {
            return <div className="text-center p-8 text-destructive">{error}</div>;
        }

        if (filteredUsers.length === 0) {
            return <div className="text-center p-8 text-muted-foreground">No users found for this country.</div>;
        }

        return (
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
                        <TableRow key={user.id} onClick={() => handleRowClick(user)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Image src={user.avatar || `https://placehold.co/40x40.png?text=${(user.fullName || 'U').charAt(0)}`} width={40} height={40} alt={user.fullName || 'User'} className="rounded-full" data-ai-hint="user avatar" />
                                    <div>
                                        <div>{user.fullName || 'Unnamed User'}</div>
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
        );
    }

    return (
        <div className="space-y-6">
             <Link href="/dashboard/analytics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
            </Link>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>{pageTitle}</CardTitle>
                            <CardDescription>
                                A list of all merchants from the selected country.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or email..."
                                    className="pl-8 w-64"
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
                                    <SelectItem value="merchant">Merchant</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
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
        </div>
    )
}
