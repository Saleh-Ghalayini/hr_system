import { Box, CircularProgress, Typography } from '@mui/material'
import React from 'react'

const Loading = () => {
  return (
    <Box className="loading">
        <CircularProgress size={40} />
        <Typography variant="body1" style={{ marginTop: 16, marginLeft: 16 }}>
          Loading ...
        </Typography>

      </Box>
  )
}

export default Loading