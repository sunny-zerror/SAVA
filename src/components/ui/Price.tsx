import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";

interface PriceProps {
  price: number;
  compareAt?: number | null;
  className?: string;
}

export default function Price({ price, compareAt, className }: PriceProps) {
  const onSale = compareAt != null && compareAt > price;
  return (
    <p className={cn("flex items-baseline gap-2 tabular-nums", className)}>
      <span className={cn(onSale && "text-sale")}>{formatPrice(price)}</span>
      {onSale && (
        <s className="text-caption text-muted">
          <span className="sr-only">Was </span>
          {formatPrice(compareAt)}
        </s>
      )}
    </p>
  );
}
