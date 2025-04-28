
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Restaurant {
  name: string;
  orders: number;
  revenue: number;
  customers: number;
}

interface RestaurantsTableProps {
  restaurants: Restaurant[];
  title: string;
}

const RestaurantsTable = ({ restaurants, title }: RestaurantsTableProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Customers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((restaurant) => (
            <TableRow key={restaurant.name}>
              <TableCell className="font-medium">{restaurant.name}</TableCell>
              <TableCell>{restaurant.orders}</TableCell>
              <TableCell>${restaurant.revenue.toLocaleString()}</TableCell>
              <TableCell>{restaurant.customers}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RestaurantsTable;
