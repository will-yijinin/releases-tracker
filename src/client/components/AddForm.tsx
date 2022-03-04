import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import { useForm } from "react-hook-form";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => {
    console.log(data)
    handleClose();
    // TODO request

  };

  return (
    <div>
      <Button color="inherit" onClick={handleClickOpen}>
        <AddIcon />
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>添加节点监控</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您将申请添加一条链的节点监控。
          </DialogContentText>
          <Box
            component="form"
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                {...register("node_name", { required: true })}
                error={errors?.node_name?.type==="required"}
                autoFocus
                label="链code"
                required
                fullWidth
                variant="standard"
                helperText="例如: btc"
              />
              <TextField
                {...register("node_full_name", { required: true })}
                error={errors?.node_full_name?.type==="required"}
                label="链全称"
                required
                fullWidth
                variant="standard"
                helperText="例如: Bitcoin"
              />
              <TextField
                {...register("feed_url", { required: true })}
                error={errors?.feed_url?.type==="required"}
                label="github节点链接"
                required
                fullWidth
                variant="standard"
                helperText="例如: https://github.com/bitcoin/bitcoin/releases"
              />
              <TextField
                {...register("lark_url", { required: true })}
                error={errors?.lark_url?.type==="required"}
                label="lark链接"
                required
                fullWidth
                variant="standard"
                helperText="例如: https://open.larksuite.com/open-apis/bot/v2/hook/4374b8b5-bd42-4ff1-b020-194e33fa728a"
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={()=>{
            handleSubmit(onSubmit)();
          }}>提交</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
