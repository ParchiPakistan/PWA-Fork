import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get merchant ID for the user
        const merchant = await prisma.merchants.findUnique({
            where: { user_id: user.id },
            select: { id: true },
        });

        if (!merchant) {
            // Check if it's a branch user
            const branch = await prisma.merchant_branches.findUnique({
                where: { user_id: user.id },
                select: { merchant_id: true }
            });

            if (branch) {
                // If branch, we might want to return stats for the branch or the whole merchant?
                // Requirement says "Merchants Dashboard", implying corporate view.
                // But if a branch logs in, they might see their own stats.
                // For now, let's assume corporate view or handle both.
                // Given the UI is "Corporate Dashboard", we restrict to merchants.
                return NextResponse.json({ message: 'Access denied: Not a corporate merchant' }, { status: 403 });
            }
            return NextResponse.json({ message: 'Merchant not found' }, { status: 404 });
        }

        const merchantId = merchant.id;

        // 1. Total Redemptions
        // Count redemptions where offer belongs to the merchant
        const totalRedemptions = await prisma.redemptions.count({
            where: {
                offers: {
                    merchant_id: merchantId
                }
            }
        });

        // 2. Unique Students
        // Count distinct student_ids in redemptions for this merchant
        const uniqueStudentsGroups = await prisma.redemptions.groupBy({
            by: ['student_id'],
            where: {
                offers: {
                    merchant_id: merchantId
                }
            },
        });
        const uniqueStudents = uniqueStudentsGroups.length;

        return NextResponse.json({
            data: {
                totalRedemptions,
                uniqueStudents,
            },
            status: 200,
            message: 'Success'
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
