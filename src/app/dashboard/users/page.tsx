
'use client';

import React, { useState, useEffect } from "react";
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
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as AuthUser } from "firebase/auth";

interface User {
    id: string;
    fullName?: string;
    email?: string;
    plan?: string;
    status?: string;
    avatar?: string;
    role?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Authentication state changed: User is logged in.", user);
                setCurrentUser(user);
                fetchUsers();
            } else {
                console.log("Authentication state changed: User is logged out.");
                setCurrentUser(null);
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        console.log("Starting to fetch users from Firestore...");
        try {
            if (!db) {
                throw new Error("Firestore database is not initialized.");
            }
            const usersCollectionRef = collection(db, "users");
            const querySnapshot = await getDocs(usersCollectionRef);
            
            const userList: User[] = [];
            querySnapshot.forEach((doc) => {
                userList.push({ id: doc.id, ...doc.data() } as User);
            });
            
            console.log(`Successfully fetched ${userList.length} users.`);
            setUsers(userList);

        } catch (err: any) {
            console.error("Error fetching users from Firestore: ", err);
            setError("Failed to load users. Check the browser console for more details.");
            toast({
                variant: "destructive",
                title: "Failed to load users",
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8">Loading users... Please wait.</div>;
        }

        if (!currentUser) {
            return <div className="text-center p-8 text-red-500 font-semibold">You must be logged in to view this page. Please try logging in again.</div>;
        }
        
        if (error) {
            return <div className="text-center p-8 text-destructive">{error}</div>
        }

        if (users.length === 0) {
            return <div className="text-center p-8 text-muted-foreground">No users found. This might be because the database is empty or there is a permission issue.</div>
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
                        {users.map((user) => (
                           <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                  <Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-3 hover:underline">
                                      <Image src={user.avatar || `https://placehold.co/40x40.png?text=${(user.fullName || 'U').charAt(0)}`} width={40} height={40} alt={user.fullName || 'User'} className="rounded-full" data-ai-hint="user avatar" />
                                      <div>
                                          <div>{user.fullName || 'Unnamed User'}</div>
                                          <div className="text-sm text-muted-foreground">{user.email}</div>
                                      </div>
                                  </Link>
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
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>1-{users.length}</strong> of <strong>{users.length}</strong> users.
                    </div>
                </CardFooter>
            </>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Users & Merchants</CardTitle>
                    <CardDescription>
                        Manage all users on the platform, including merchants and administrators.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    )
}
