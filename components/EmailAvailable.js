import React, {useCallback, useState} from 'react';
import {Avatar, Card, DataTable, Link, Page} from '@shopify/polaris';

export default function EmailAvailable(props) {
    const [sortedRows, setSortedRows] = useState(null);

    const initiallySortedRows = [
      [
        "example@example.com",
        "This is Email Descripton",
        <Link
          removeUnderline
          url="https://www.example.com"
          key="emerald-silk-gown"
        >
          Actions
        </Link>,
      ],
      [
        "example@example.com",
        "This is Email Descripton",
        <Link
          removeUnderline
          url="https://www.example.com"
          key="emerald-silk-gown"
        >
          Actions
        </Link>,
      ],
      [
        "example@example.com",
        "This is Email Descripton",
        <Link
          removeUnderline
          url="https://www.example.com"
          key="emerald-silk-gown"
        >
          Actions
        </Link>,
      ]


      
    ];
  
    const rows = sortedRows ? sortedRows : initiallySortedRows;
    const handleSort = useCallback(
      (index, direction) => setSortedRows(sortCurrency(rows, index, direction)),
      [rows],
    );
  
    return (
      <Page title={props.title}>
        <Card>
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'numeric',
              'numeric',
            ]}
            headings={[
                'Email',
                'Description',
              'Actions',
            ]}
            rows={rows}
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