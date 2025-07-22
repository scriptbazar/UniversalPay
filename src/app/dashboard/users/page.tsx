
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
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";

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
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const usersCollectionRef = collection(db, "users");
                const unsubscribeSnapshot = onSnapshot(usersCollectionRef, (querySnapshot) => {
                    const userList: User[] = [];
                    querySnapshot.forEach((doc) => {
                        userList.push({ id: doc.id, ...doc.data() } as User);
                    });
                    setUsers(userList);
                    setLoading(false);
                }, (err: any) => {
                    console.error("Error fetching users from Firestore: ", err);
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
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [toast]);
    
    const handleRowClick = (user: User) => {
        setSelectedUser(user);
    };

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
        });
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
                        Manage all users on the platform, including merchants and administrators. Click a user to see details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
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
