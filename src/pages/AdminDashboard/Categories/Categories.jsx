import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Plus , Pencil,Trash2 } from "lucide-react";

import "./Categories.css";

function Categories() {
  const { session } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
const [editCategoryName, setEditCategoryName] = useState("");
const [updating, setUpdating] = useState(false);
const [deletingCategory, setDeletingCategory] = useState(null);
const [deleting, setDeleting] = useState(false);
  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/categories",
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      console.log("GET Categories response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch categories"
        );
      }

      setCategories(data.categories);
    } catch (error) {
      console.error("Fetch categories error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
const handleUpdateCategory = async (e) => {
  e.preventDefault();

  if (!editCategoryName.trim()) {
    return;
  }

  try {
    setUpdating(true);
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/categories/${editingCategory.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: editCategoryName.trim(),
        }),
      }
    );

    const data = await response.json();

    console.log("Update category response:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update category"
      );
    }

    await fetchCategories();

    setEditingCategory(null);
    setEditCategoryName("");

  } catch (error) {
    console.error("Update category error:", error);
    setError(error.message);
  } finally {
    setUpdating(false);
  }
};
const handleDelete = async () => {
  if (!deletingCategory) return;

  try {
    setDeleting(true);
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/categories/${deletingCategory.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Delete category response:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete category"
      );
    }

    setCategories((prevCategories) =>
      prevCategories.filter(
        (category) => category.id !== deletingCategory.id
      )
    );

    setDeletingCategory(null);

  } catch (error) {
    console.error("Delete category error:", error);
    setError(error.message);
  } finally {
    setDeleting(false);
  }
};
  // Fetch when authenticated session is available
  useEffect(() => {
    if (session?.access_token) {
      fetchCategories();
    }
  }, [session]);

  // Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            name: categoryName.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log("POST Category response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create category"
        );
      }

      // Get the latest categories from the database
      await fetchCategories();

      // Reset form
      setCategoryName("");
      setShowForm(false);

    } catch (error) {
      console.error("Create category error:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="categories-page">

      <div className="categories-header">
        <div>
          <h2>Categories</h2>

          <p>
            Manage vehicle categories used across your fleet.
          </p>
        </div>

        <button
          className="add-category-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <div className="category-form-card">

          <div className="category-form-header">
            <div>
              <h3>Add Category</h3>

              <p>
                Create a new vehicle category.
              </p>
            </div>

            <button
              type="button"
              className="category-form-close"
              onClick={() => {
                setShowForm(false);
                setCategoryName("");
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddCategory}>

            <div className="category-form-group">

              <label htmlFor="category-name">
                Category Name
              </label>

              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(e.target.value)
                }
                placeholder="e.g. Sedan"
                disabled={submitting}
              />

            </div>

            <div className="category-form-actions">

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setCategoryName("");
                }}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Adding..."
                  : "Add Category"}
              </button>

            </div>

          </form>

        </div>
      )}
{editingCategory && (
  <div className="category-form-card">

    <div className="category-form-header">
      <div>
        <h3>Edit Category</h3>

        <p>
          Update the category name.
        </p>
      </div>

      <button
        type="button"
        className="category-form-close"
        onClick={() => {
          setEditingCategory(null);
          setEditCategoryName("");
        }}
      >
        ×
      </button>
    </div>

    <form onSubmit={handleUpdateCategory}>

      <div className="category-form-group">

        <label htmlFor="edit-category-name">
          Category Name
        </label>

        <input
          id="edit-category-name"
          type="text"
          value={editCategoryName}
          onChange={(e) =>
            setEditCategoryName(e.target.value)
          }
          disabled={updating}
        />

      </div>

      <div className="category-form-actions">

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setEditCategoryName("");
          }}
          disabled={updating}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={updating}
        >
          {updating ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </form>

  </div>
)}
      {loading && (
        <div className="categories-state">
          <p>Loading categories...</p>
        </div>
      )}

      {!loading && error && (
        <div className="categories-state categories-error">
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        categories.length === 0 && (
          <div className="categories-state">
            <h3>No categories yet</h3>

            <p>
              Add your first vehicle category to get
              started.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        categories.length > 0 && (
          <div className="categories-grid">

            {categories.map((category) => (
            <div
  className="category-card"
  key={category.id}
>
  <div className="category-card-top">

    <h3>{category.name}</h3>

   <div className="category-card-actions">

  <button
    className="category-edit-button"
    onClick={() => {
      setEditingCategory(category);
      setEditCategoryName(category.name);
    }}
    aria-label={`Edit ${category.name}`}
    title="Edit category"
  >
    <Pencil size={15} />
  </button>

  <button
    className="category-delete-button"
    onClick={() => setDeletingCategory(category)}
    aria-label={`Delete ${category.name}`}
    title="Delete category"
  >
    <Trash2 size={15} />
  </button>

</div>

  </div>

  <span>
    Created{" "}
    {new Date(category.created_at).toLocaleDateString()}
  </span>
</div>
            ))}

          </div>
        )}
{deletingCategory && (
  <div className="delete-modal-overlay">

    <div className="delete-modal">

      <div className="delete-modal-icon">
        <Trash2 size={22} />
      </div>

      <div className="delete-modal-content">

        <h3>Delete Category?</h3>

        <p>
          Are you sure you want to delete{" "}
          <strong>{deletingCategory.name}</strong>?
          This action cannot be undone.
        </p>

      </div>

      <div className="delete-modal-actions">

        <button
          type="button"
          className="delete-modal-cancel"
          onClick={() => setDeletingCategory(null)}
          disabled={deleting}
        >
          Cancel
        </button>

        <button
          type="button"
          className="delete-modal-confirm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Category"}
        </button>

      </div>

    </div>

  </div>
)}
    </div>
   
  );
}

export default Categories;