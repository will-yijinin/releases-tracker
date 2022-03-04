import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Dropdown from "./Dropdown";

export default function Orders(props) {
  const { nodeList } = props;
  return (
    <React.Fragment>
      <Title>节点版本</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>链</TableCell>
            <TableCell>链全称</TableCell>
            <TableCell>运维版本</TableCell>
            <TableCell>github最新版本</TableCell>
            <TableCell>
              <Button color="inherit">
                <AddIcon />
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodeList.map((item) => (
            <TableRow key={item.feed_url}>
              <TableCell>{item.node_name}</TableCell>
              <TableCell>{item.node_full_name}</TableCell>
              <TableCell>{item.op_node_version}</TableCell>
              <TableCell>
                <Link
                  target="_blank"
                  color="inherit"
                  href={item.feed_url.substring(0, item.feed_url.length-5)}
                >
                  {item.github_node_version}
                </Link>
              </TableCell>
              <TableCell>
                <Dropdown item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
