import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, amount, status, method, customerEmail, merchantId, signature } = body;

    if (!transactionId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: transactionId and amount" },
        { status: 400 }
      );
    }

    // Record webhook payload event log in Firestore
    await addDoc(collection(db, "webhook_logs"), {
      transactionId,
      amount,
      status: status || 'Success',
      method: method || 'UPI',
      customerEmail: customerEmail || 'api-webhook@client.com',
      merchantId: merchantId || 'mch_live_default',
      signature: signature || null,
      receivedAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: `Webhook processed successfully for transaction ${transactionId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook payload" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "UniversalPay Live Webhook Service",
    version: "v1.0",
    docs: "/dashboard/developer"
  });
}
