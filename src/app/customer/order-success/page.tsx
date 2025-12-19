'use client';

import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse-soft">
        <CheckCircleIcon className="w-16 h-16 text-green-500" />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Order Placed!</h1>
        <p className="text-warm-600 max-w-xs mx-auto">
          Your order has been sent to the kitchen. Sit tight, delicious food is on the way!
        </p>
      </div>

      <div className="pt-8 w-full space-y-3">
        <Link href="/customer/menu" className="btn btn-primary w-full">
          Order More Items
        </Link>
        <Link href="/customer/menu" className="btn btn-ghost w-full">
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
