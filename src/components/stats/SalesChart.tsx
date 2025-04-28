
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface SalesData {
  date: string;
  amount: number;
}

interface SalesChartProps {
  data: SalesData[];
  title: string;
}

const SalesChart = ({ data, title }: SalesChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ChartContainer 
        className="h-[250px]" 
        config={{
          sales: {
            theme: {
              light: "#0ea5e9",
              dark: "#38bdf8",
            },
          },
        }}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip />
          <Line type="monotone" dataKey="amount" name="Sales" stroke="var(--color-sales)" />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default SalesChart;
