interface TransactionItemProps {
  customerName?: string;
  description?: string;
  time: string;
  amount: string;
  type: string;
  icon: string;
  iconColor: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const iconColorClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
};

const amountColorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export default function TransactionItem({
  customerName,
  description,
  time,
  amount,
  type,
  icon,
  iconColor
}: TransactionItemProps) {
  return (
    <div className="transaction-item">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${iconColorClasses[iconColor]}`}>
          <i className={`${icon} text-sm`}></i>
        </div>
        <div>
          <p className="font-medium">{customerName || description}</p>
          <p className="text-sm text-gray-600">{time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold number-font ${amountColorClasses[iconColor]}`}>
          {amount}
        </p>
        <p className="text-xs text-gray-500">{type}</p>
      </div>
    </div>
  );
}
