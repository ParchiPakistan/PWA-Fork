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

        // Group redemptions by branch
        const branchStats = await prisma.redemptions.groupBy({
            by: ['branch_id'],
            where: {
                offers: { merchant_id: merchantId },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                }
            }
        });

        // Fetch branch names
        const branchIds = branchStats.map((stat: { branch_id: string }) => stat.branch_id);
        const branches = await prisma.merchant_branches.findMany({
            where: {
                id: { in: branchIds },
            },
            select: {
                id: true,
                branch_name: true,
            }
        });

        const branchMap = new Map(branches.map((b: { id: string; branch_name: string }) => [b.id, b.branch_name]));

        const result = branchStats.map((stat: { branch_id: string; _count: { id: number } }) => ({
            branch: branchMap.get(stat.branch_id) || 'Unknown Branch',
            redemptions: stat._count.id,
            // Growth is hard to calculate without historical data context, omitting for now or sending 0
            growth: '+0%',
        }));

        return NextResponse.json({
            data: result,
            status: 200,
            message: 'Success'
        });

    } catch (error) {
        console.error('Branch performance error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
