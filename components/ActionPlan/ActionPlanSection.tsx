'use client';

import { ActionPlanItem } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';

interface ActionPlanSectionProps {
  actionPlans: ActionPlanItem[];
  counts: {
    open: number;
    pending: number;
    overdue: number;
  };
  categoryId: string;
}

export function ActionPlanSection({ actionPlans, counts }: ActionPlanSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-cyan-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'overdue':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Action Plan</h4>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-cyan-500 text-white text-xs font-semibold">
            {counts.open.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-yellow-500 text-white text-xs font-semibold">
            {counts.pending.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500 text-white text-xs font-semibold">
            {counts.overdue.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 pb-1 border-b">
          <div>Action Plan Title</div>
          <div className="text-center">Due Date</div>
          <div className="text-center">Status</div>
        </div>

        {actionPlans.map((plan) => (
          <div
            key={plan.id}
            className="grid grid-cols-3 gap-2 text-xs py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(plan.status)}`} />
              <span className="truncate">{plan.title}</span>
            </div>
            <div className="text-center text-gray-600">{plan.dueDate}</div>
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0 capitalize ${getStatusBadgeColor(plan.status)}`}
              >
                {plan.status}
              </Badge>
            </div>
          </div>
        ))}

        {actionPlans.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            No action plans available
          </div>
        )}
      </div>
    </div>
  );
}
