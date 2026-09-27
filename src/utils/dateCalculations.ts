/**
 * SaaS License & Countdown utility functions
 */

export function getDaysRemaining(expiresAt: string): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatCountdownBadge(
  expiresAt: string,
  isSuspended: boolean,
  isDemo?: boolean
): {
  text: string;
  badgeClass: string;
  status: 'suspended' | 'expired' | 'warning' | 'active' | 'demo';
  days: number;
} {
  if (isSuspended) {
    return {
      text: '❄️ DONDURULDU',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      status: 'suspended',
      days: 0,
    };
  }

  const days = getDaysRemaining(expiresAt);

  if (isDemo) {
    if (days <= 0) {
      return {
        text: '🎁 Demo Doldu (0 Gün)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        status: 'expired',
        days,
      };
    }
    return {
      text: `🎁 Demo: ${days} Gün Kaldı`,
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-xs',
      status: 'demo',
      days,
    };
  }

  if (days <= 0) {
    return {
      text: '⚠️ Süresi Doldu (0 Gün)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      status: 'expired',
      days,
    };
  }

  if (days <= 15) {
    return {
      text: `🚨 Son ${days} Gün!`,
      badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse',
      status: 'warning',
      days,
    };
  }

  if (days <= 45) {
    return {
      text: `⏳ ${days} Gün Kaldı`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
      status: 'warning',
      days,
    };
  }

  return {
    text: `✅ ${days} Gün Aktif`,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium',
    status: 'active',
    days,
  };
}

export function generateSaaSInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `APS${year}-${randomSuffix}`;
}
