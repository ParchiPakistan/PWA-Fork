import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const merchant = await prisma.merchants.findUnique({
            where: { user_id: user.id },
            select: { id: true },
        });

        if (!merchant) return NextResponse.json({ message: 'Merchant not found' }, { status: 404 });

        const merchantId = merchant.id;

        // Get today's range
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const redemptions = await prisma.redemptions.findMany({
            where: {
                offers: { merchant_id: merchantId },
                created_at: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            select: {
                created_at: true,
            },
        });

        // Group by hour
        const hourlyData: Record<number, number> = {};
        // Initialize with 0 for relevant hours (e.g., 8 to 22) or all 24
        // The UI shows 08:00 to 22:00. Let's provide all active hours found or a specific range.
        // Let's return what lines up with the UI or just raw data.
        // The UI `mockRedemptionTimeOfDay` has specific times.
        // I'll group by actual hour.

        redemptions.forEach((r: { created_at: Date | null }) => {
            if (r.created_at) {
                const hour = new Date(r.created_at).getHours();
                hourlyData[hour] = (hourlyData[hour] || 0) + 1;
            }
        });

        // Format for chart: "HH:00"
        const result = Object.entries(hourlyData).map(([hour, count]) => ({
            time: `${hour.toString().padStart(2, '0')}:00`,
            count,
        })).sort((a, b) => a.time.localeCompare(b.time));

        // Fill in gaps if needed? The UI chart might look weird if only simple points.
        // Let's assume frontend handles it or we return sparse data.
        // Better: Return a fixed set of hours or at least sorted.
        // I will return sorted active hours.

        return NextResponse.json({
            data: result,
            status: 200,
            message: 'Success'
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
