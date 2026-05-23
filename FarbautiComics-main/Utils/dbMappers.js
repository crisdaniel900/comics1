export const mapProductRow = (row) => ({
  _id: row.id,
  id: row.external_id,
  productModel_id: row.product_model_id,
  title: row.title,
  price: row.price,
  image: row.image,
  imagePublicId: row.image_public_id,
  category: row.category,
  artistWriter: row.artist_writer,
  coverArtist: row.cover_artist,
  publisher: row.publisher,
  countryManufacture: row.country_manufacture,
  language: row.language,
  style: row.style,
  genre: row.genre,
  format: row.format,
  type: row.type,
  description: row.description,
  stock: row.stock,
  available: row.available,
  hearts: row.hearts,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapUserRow = (row) => {
  if (!row) return row;

  return {
    _id: row.id,
    userModel_id: row.usermodel_id,
    name: row.name,
    lastName: row.last_name ?? row.lastname ?? '',
    username: row.username,
    email: row.email,
    favorites: row.favorites || [],
    wishlist: row.wishlist || [],
    readHistory: row.read_history || row.readhistory || [],
    cartData: row.cart_data || [],
    purchases: row.purchases || [],
    address: row.address,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapPostRow = (row) => ({
  _id: row.id,
  title: row.title,
  content: row.content,
  image: row.image,
  author: row.author,
  type: row.type,
  category: row.category,
  votes: row.votes,
  downvotes: row.downvotes,
  comments: row.comments || [],
  postDate: row.postdate,
  votedBy: row.votedby || [],
  downvotedBy: row.downvotedby || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapCommentRow = (row, username = null) => ({
  _id: row.id,
  post: row.postid,
  user: username ? { username } : row.userid,
  content: row.content,
  votes: row.votes,
  downvotes: row.downvotes,
  votedBy: row.votedby || [],
  createdAt: row.created_at,
});

export const mapOrderRow = (row) => ({
  _id: row.id,
  user: row.user_id,
  userName: row.user_name,
  userEmail: row.user_email,
  items: row.items || [],
  subtotal: row.subtotal,
  total: row.total,
  invoiceNumber: row.invoice_number,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

