'use client'
import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc } from 'firebase/firestore'
import { Camera } from 'react-camera-pro'
import './styles.css'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [image, setImage] = useState(null)
  const [editPhoto, setEditPhoto] = useState(false)
  const cameraRef = useRef(null)

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      const sortedInventory = inventoryList.sort((a, b) => a.name.localeCompare(b.name))
      setInventory(sortedInventory)
      setFilteredInventory(sortedInventory)
      console.log('Inventory updated:', sortedInventory)
    } catch (error) {
      console.error('Error updating inventory:', error)
    }
  }

  const addItem = async (item, quantity, imageUrl = null) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      await setDoc(docRef, { quantity, image: imageUrl })
      console.log('Item added:', { item, quantity, imageUrl })
      await updateInventory()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      await deleteDoc(docRef)
      console.log('Item removed:', item)
      await updateInventory()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const handleItemExists = (itemName) => {
    return inventory.some((item) => item.name.toLowerCase() === itemName.toLowerCase())
  }

  const handleOpen = (item) => {
    if (item) {
      setEditingItem(item)
      setItemName(item.name)
      setItemQuantity(item.quantity)
      setImage(item.image || null)
      setEditPhoto(false)
    } else {
      setEditingItem(null)
      setItemName('')
      setItemQuantity('')
      setImage(null)
      setEditPhoto(false)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setItemName('')
    setItemQuantity('')
    setEditingItem(null)
    setImage(null)
    setEditPhoto(false)
    setOpen(false)
    setCameraOpen(false)
  }

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = inventory.filter(({ name }) =>
      name.toLowerCase().includes(query)
    )
    const sortedFiltered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    setFilteredInventory(sortedFiltered)
  }

  const handleEdit = async () => {
    if (itemName && itemQuantity > 0) {
      if (editingItem) {
        await removeItem(editingItem.name)
      }
      await addItem(itemName, parseInt(itemQuantity, 10), image || null)
      handleClose()
    }
  }

  const handleAdd = async () => {
    if (itemName && itemQuantity > 0) {
      if (handleItemExists(itemName)) {
        alert('Item already exists. Please add another item.')
        return
      }
      setOpen(false)
      setCameraOpen(true)
    }
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto()
        if (photo) {
          setImage(photo)
          setEditPhoto(true)
          setCameraOpen(false) // Close camera after taking photo
        } else {
          console.error('Photo capture failed.')
        }
      } catch (error) {
        console.error('Error taking photo:', error)
      }
    }
  }

  const handleSaveWithoutPhoto = async () => {
    if (itemName && itemQuantity > 0) {
      await addItem(itemName, parseInt(itemQuantity, 10), null)
      handleClose()
    }
  }

  const handleUpdatePhoto = async () => {
    if (itemName && itemQuantity > 0 && image) {
      await handleEdit()
      setEditPhoto(false)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  return (
    <Box className="container">
      <Box className="inner-container">
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box className="modal">
            <Typography id="modal-title" variant="h6" component="h2" className="modal-title">
              {editingItem ? 'Edit Item' : 'Add Item'}
            </Typography>
            <Stack className="modal-content">
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                type="number"
                fullWidth
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                inputProps={{ min: 0 }}
              />
              {editingItem ? (
                <Stack spacing={2}>
                  {image && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleRemoveImage}
                    >
                      Remove Image
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    className="update-button"
                    onClick={handleEdit}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    className="remove-button"
                    onClick={() => {
                      removeItem(editingItem.name)
                      handleClose()
                    }}
                  >
                    Remove Item
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    className="add-button"
                    onClick={handleAdd}
                  >
                    Add
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        </Modal>
        <Modal
          open={cameraOpen}
          onClose={() => setCameraOpen(false)}
          aria-labelledby="camera-title"
          aria-describedby="camera-description"
        >
          <Box className="modal" sx={{ width: '90vw', height: '80vh', position: 'relative' }}>
            <Typography id="camera-title" variant="h6" component="h2" className="modal-title">
              Camera
            </Typography>
            <Camera ref={cameraRef} style={{ width: '100%', height: 'calc(60vh - 60px)' }} />
            <Stack
              spacing={2}
              sx={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)' }}
            >
              <Button
                variant="contained"
                className="camera-button"
                onClick={handleTakePhoto}
              >
                Take Photo
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setCameraOpen(false)}
              >
                Close Camera
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveWithoutPhoto}
              >
                Save Without Photo
              </Button>
            </Stack>
          </Box>
        </Modal>
        {editPhoto && (
          <Modal
            open={editPhoto}
            onClose={() => setEditPhoto(false)}
            aria-labelledby="photo-edit-title"
            aria-describedby="photo-edit-description"
          >
            <Box className="modal">
              <Typography id="photo-edit-title" variant="h6" component="h2" className="modal-title">
                Edit Photo
              </Typography>
              <Box className="photo-preview">
                <img src={image} alt="Preview" className="photo-preview-image" />
              </Box>
              <Stack spacing={2} sx={{ marginTop: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdatePhoto}
                >
                  Save Photo
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setEditPhoto(false)}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          </Modal>
        )}
        <Box className="flex-container">
          <Box className="left-section">
            <Box className="add-search-box">
              <TextField
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearch}
                className="search-field"
              />
              <Button variant="contained" className="add-item-button" onClick={() => handleOpen(null)}>
                Add New Item
              </Button>
            </Box>
          </Box>
          <Box className="right-section">
            <Box className="inventory-box">
              <Box className="inventory-header">
                <Typography variant="h2" className="inventory-title">
                  Inventory Items
                </Typography>
              </Box>
              <Box className="inventory-list-container">
                <Stack className="inventory-list">
                  {filteredInventory.map(({ name, quantity, image }) => (
                    <Box key={name} className="inventory-item">
                      <Box className="item-image-container">
                        {image && <img src={image} alt="Item image" className="item-image" />}
                      </Box>
                      <Box className="item-details">
                        <Typography variant="h4" className="item-name">
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Typography>
                        <Typography variant="h5" className="item-quantity">
                          Quantity: {quantity}
                        </Typography>
                        <Button
                          variant="contained"
                          className="edit-button"
                          onClick={() => handleOpen({ name, quantity, image })}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
