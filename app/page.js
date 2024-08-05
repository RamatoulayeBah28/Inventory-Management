'use client'
import Image from "next/image"
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import {Box, Button, Modal, Stack, TextField, Typography, Paper} from '@mui/material'
import {collection, deleteDoc, doc, getDocs, query, setDoc, getDoc, serverTimestamp, Timestamp} from 'firebase/firestore'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    const sortedInventory = inventoryList.sort((a, b) => {
      const timestampA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const timestampB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return timestampB - timestampA;
    });
    setInventory(sortedInventory)
    setFilteredInventory(sortedInventory)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {
        quantity: quantity + 1,
        timestamp: serverTimestamp()
      }, { merge: true })
    } else {
      await setDoc(docRef, {quantity: 1,
        createdAt: serverTimestamp() // Only set createdAt for new items
      })
    } 
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) {
      const {quantity} = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    const filtered = inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredInventory(filtered)
  }, [searchTerm, inventory])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  
  return (
    <>
      <div style={{
        zIndex: -1,
        position: "fixed",
        width: "100vw",
        height: "100vh"
      }} >
        <Image
          src="/pantry2.jpeg"
          alt="Pantry background"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div style={{
        zIndex: -1,
        position: "fixed",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)" // Adjust the last value (0.4) to control darkness
      }} />
      <h1 style={{
        paddingTop: "10vh",
        fontFamily: "monospace",
        fontSize: "3.5rem",
        fontWeight: "bold",
        textAlign: "center",
        position: "center",
        color: "white",
        marginBottom: "1rem",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
      }}>P A N T R Y <hr></hr>T R A C K E R</h1>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        {/* ... [Modal code remains the same] */}
        
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
        >
          Add New Item
        </Button>
        <Modal open={open} onClose={handleClose}>
          <Box position="absolute" top="50%" left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}

                onChange={(e) => {
                  setItemName(e.target.value)
                } } />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                } }
              >Add</Button>
            </Stack>
          </Box>
        </Modal>
        
        <Paper elevation={3} sx={{ width: '800px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <TextField
            variant="outlined"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{ marginBottom: '20px' }}
          />
          
          <Box border="1px solid #333" sx={{ backgroundColor: 'white' }}>
            <Box
              width="100%"
              height="100px"
              bgcolor="#ADD8E6"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h2" fontFamily="monospace" color="#333">Inventory Items</Typography>
            </Box>
            <Stack width="100%" height="300px" spacing={2} overflow="auto">
              {filteredInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="150px"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor='white'
                  padding={5}
                  borderBottom="1px solid #eee"
                >
                  <Typography variant="h3" color="#333" textAlign="center">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#333" textAlign="center">
                    {quantity}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={() => addItem(name)}
                      sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => removeItem(name)}
                      sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </>
  )
}

