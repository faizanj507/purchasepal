import React, {useCallback, useState} from 'react';
import {Avatar, Card, DataTable, Link, Page} from '@shopify/polaris';

export default function RemindedProducts() {
    const [sortedRows, setSortedRows] = useState(null);

    const initiallySortedRows = [
      [
        <Avatar/>,
        <Link
          removeUnderline
          url="https://www.example.com"
          key="emerald-silk-gown"
        >
          Emerald Silk Gown
        </Link>,
        '$875.00',
        124689,
        374,
        12,
        "yesterday",
      ],
      [
        <Avatar/>,
        <Link
            removeUnderline
            url="https://www.example.com"
            key="mauve-cashmere-scarf"
        >
            Mauve Cashmere Scarf
        </Link>,
        '$230.00',
        124533,
        83,
        12,
        "yesterday",
        ],
        [
        <Avatar/>,
        <Link
            removeUnderline
            url="https://www.example.com"
            key="navy-merino-wool"
        >
            Navy Merino Wool Blazer with khaki chinos and yellow belt
        </Link>,
        '$445.00',
        124518,
        32,
        12,
        "yesterday",
        ],
        [
        <Avatar/>,
        <Link
            removeUnderline
            url="https://www.example.com"
            key="navy-merino-wool"
        >
            Navy Merino Wool Blazer with khaki chinos and yellow belt
        </Link>,
        '$445.00',
        124518,
        32,
        12,
        "yesterday",
        ],
        [
        <Avatar/>,
        <Link
            removeUnderline
            url="https://www.example.com"
            key="navy-merino-wool"
        >
            Navy Merino Wool Blazer with khaki chinos and yellow belt
        </Link>,
        '$445.00',
        124518,
        32,
        12,
        "yesterday",
        ],

      
    ];
  
    const rows = sortedRows ? sortedRows : initiallySortedRows;
    const handleSort = useCallback(
      (index, direction) => setSortedRows(sortCurrency(rows, index, direction)),
      [rows],
    );
  
    return (
      <Page title="Reminders Table">
        <Card>
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'numeric',
              'numeric',
              'numeric',
              'numeric',
              'text',
            ]}
            headings={[
                'Image',
              'Product',
              'Price',
              'Reminders',
              'Reminders Sent',
              'pending',
                'Last Reminded',
            ]}
            rows={rows}
            totals={['', '', '','', 255,'','']}
            sortable={[false, true, false, false, true]}
            defaultSortDirection="descending"
            initialSortColumnIndex={4}
            onSort={handleSort}
            footerContent={`Showing ${rows.length} of ${rows.length} results`}
          />
        </Card>
      </Page>
    );
  
    function sortCurrency(rows, index, direction) {
      return [...rows].sort((rowA, rowB) => {
        const amountA = parseFloat(rowA[index].substring(1));
        const amountB = parseFloat(rowB[index].substring(1));
  
        return direction === 'descending' ? amountB - amountA : amountA - amountB;
      });
    }
  }