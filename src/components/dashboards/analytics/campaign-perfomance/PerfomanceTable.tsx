import React from 'react';
import { Table } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';

const PerfomanceTableRow = ({ campaigns, cost, revenue }) => {
  return (
    <tr>
      <td className="text-truncate">{campaigns}</td>
      <td className="text-truncate text-end">${cost}</td>
      <td className="text-truncate text-end">${revenue}</td>
    </tr>
  );
};


const PerfomanceTable = ({ data }) => {
  return (
    <SimpleBar>
      <Table className="fs-10 mb-0 overflow-hidden">
        <thead className="bg-100">
          <tr>
            <th className="text-800 text-nowrap">Top Campaigns</th>
            <th className="text-800 text-nowrap text-end">Cost</th>
            <th className="text-800 text-nowrap text-end">Revenue from Ads</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <PerfomanceTableRow
              key={item.id}
              campaigns={item.campaigns}
              cost={item.cost}
              revenue={item.revenue}
            />
          ))}
        </tbody>
      </Table>
    </SimpleBar>
  );
};

export default PerfomanceTable;
