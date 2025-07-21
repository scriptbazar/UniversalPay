
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
import { useRouter } from "next/navigation";

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
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Authentication state confirmed: User is logged in.", user.uid);
                setCurrentUser(user);
                fetchUsers();
            } else {
                console.log("Authentication state confirmed: User is logged out.");
                setCurrentUser(null);
                setLoading(false);
                // Optional: redirect to login if not authenticated
                // router.push('/admin'); 
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        console.log("Fetching users from Firestore...");
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
            // This is the specific error the user was seeing.
            if (err.code === 'permission-denied') {
                 setError("Permission Denied: Your account does not have the necessary permissions to view all users. Please check your security rules in Firebase to ensure admins can list the 'users' collection.");
            } else {
                setError(`Failed to load users: ${err.message}`);
            }
            toast({
                variant: "destructive",
                title: "Failed to load users",
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleRowClick = (userId: string) => {
        router.push(`/dashboard/users/${userId}`);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8 text-muted-foreground">Loading users...</div>;
        }
        
        if (error) {
            return <div className="text-center p-8 text-destructive">{error}</div>;
        }

        if (users.length === 0) {
            return <div className="text-center p-8 text-muted-foreground">No users found in the database.</div>;
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
                           <TableRow key={user.id} onClick={() => handleRowClick(user.id)} className="cursor-pointer hover:bg-muted/50">
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
