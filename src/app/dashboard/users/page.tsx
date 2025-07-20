
'use client';

import {
  File,
  PlusCircle,
  MoreHorizontal,
} from "lucide-react"
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, query } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
    const { toast } = useToast();

    useEffect(() => {
        console.log("UsersPage: useEffect triggered.");

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("UsersPage: User is authenticated, attempting to fetch users.");
                fetchUsers();
            } else {
                console.log("UsersPage: User is not authenticated.");
                setLoading(false);
                setError("You must be logged in to view this page.");
            }
        });

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            console.log("UsersPage: fetchUsers function started.");

            try {
                // Ensure db object is valid
                if (!db) {
                    throw new Error("Firestore database is not initialized.");
                }

                console.log("UsersPage: Querying 'users' collection...");
                const usersCollectionRef = collection(db, "users");
                const q = query(usersCollectionRef);
                const querySnapshot = await getDocs(q);
                
                console.log(`UsersPage: Firestore query returned ${querySnapshot.size} documents.`);

                if (querySnapshot.empty) {
                    console.log("UsersPage: No users found in the 'users' collection.");
                }

                const userList: User[] = [];
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    console.log(`UsersPage: Fetched user data for doc ID ${doc.id}:`, userData);
                    userList.push({ id: doc.id, ...userData } as User);
                });

                setUsers(userList);
                console.log("UsersPage: State updated with fetched users.", userList);

            } catch (err: any) {
                console.error("UsersPage: Error fetching users from Firestore: ", err);
                setError("Failed to load users. Check the browser console and Firestore security rules for more details. Error: " + err.message);
                toast({
                    variant: "destructive",
                    title: "Failed to load users",
                    description: err.message,
                });
            } finally {
                setLoading(false);
                console.log("UsersPage: fetchUsers function finished.");
            }
        };

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [toast]);

  return (
    <div className="space-y-6">
       <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add User
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Users & Merchants</CardTitle>
              <CardDescription>
                Manage all users on the platform, including merchants and administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {loading && <div className="text-center p-8">Loading users... Please wait.</div>}
               
               {error && <div className="text-center p-8 text-red-500">{error}</div>}

               {!loading && !error && users.length === 0 && (
                   <div className="text-center p-8 text-muted-foreground">No users found in the database.</div>
               )}

               {!loading && !error && users.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
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
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                        aria-haspopup="true"
                                        size="icon"
                                        variant="ghost"
                                        >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                          <Link href={`/dashboard/users/${user.id}`}>View Details</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Login as User</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{users.length}</strong> of <strong>{users.length}</strong>{" "}
                users
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
