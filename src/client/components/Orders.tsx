import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import Button from '@mui/material/Button';
import Dropdown from "./Dropdown";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddForm from "./AddForm";
import Alert from '@mui/material/Alert';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import HttpRequestClient from "../utils/request";
import { useDispatch } from 'react-redux';
import { fetchNodeList } from './dashboardSlice';

const statusMap = {
  "SAME": {text: "一致", severity: "success"},
  "UNCONFIRMED": {text: "未确认", severity: "error"},
  "CONFIRMED": {text: "已确认 - 不需升级", severity: "success"},
  "WAITING": {text: "已确认 - 待处理", severity: "warning"},
};

export default function Orders(props) {
  const { nodeList } = props;

  // Alert Dialog state
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertItem, setAlertItem] = React.useState({node_full_name: ""});
  const handleAlertOpen = (item) => {
    setAlertOpen(true);
    setAlertItem(item);
  }
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Edit Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState({node_name: ""});
  const [radioValue, setRadioValue] = React.useState("");
  const handleEditOpen = (item) => {
    setEditOpen(true);
    setEditItem(item);
  }
  const handleEditClose = () => {
    setEditOpen(false);
  };

  const dispatch = useDispatch();
  const handleEditConfirm = async () => {
    const endpint = radioValue==="noupgrade" ? "/confirm/no-update" : "/confirm/waiting";
    const res = await HttpRequestClient.post(
      endpint,
      {nodeName: editItem.node_name}
    );
    if(res.code===200){
      handleEditClose();
      dispatch(fetchNodeList());
    }else{
      // TODO: error alert
    }
  }
  const radioGroupRef = React.useRef(null);

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
            <TableCell>状态</TableCell>
            <TableCell>
              <AddForm />
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
                <Alert
                  severity={statusMap[item.status]?.severity || "warning"}
                  style={{padding: "0px 10px"}}
                >
                  {statusMap[item.status]?.text || "无状态"}
                </Alert>
              </TableCell>
              <TableCell>
                <Dropdown
                  item={item}
                  handleAlertOpen={handleAlertOpen}
                  handleEditOpen={handleEditOpen}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Alert Dialog */}
      <Dialog
        open={alertOpen}
        onClose={handleAlertClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"删除这条链?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            您将发出删除 <b>{alertItem.node_full_name}</b> 的申请。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose}>否</Button>
          <Button
            onClick={()=>{
              handleAlertClose();
              // TODO request
            }}
            autoFocus
          >
            是
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        open={editOpen}
        onClose={handleEditClose}
      >
        <DialogTitle>修改状态</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            ref={radioGroupRef}
            aria-label="ringtone"
            name="ringtone"
            value={radioValue}
            onChange={(event)=>{
              setRadioValue(event.target.value);
            }}
          >
            <FormControlLabel
              value={"noupgrade"}
              key={"noupgrade"}
              control={<Radio />}
              label={"不需要升级"}
            />
            <FormControlLabel
              value={"upgrade"}
              key={"upgrade"}
              control={<Radio />}
              label={"需要升级"}
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleEditClose}>
            取消
          </Button>
          <Button onClick={handleEditConfirm}>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
