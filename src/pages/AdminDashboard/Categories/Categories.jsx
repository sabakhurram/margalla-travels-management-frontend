import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Plus,
  Pencil,
  Trash2,
  Gauge,
} from "lucide-react";

import "./Categories.css";

function Categories({ searchQuery = "" }) {
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
const [deleteError, setDeleteError] = useState("");
const [monthlyLimits, setMonthlyLimits] = useState({});
const [monthlyLimitCategory, setMonthlyLimitCategory] = useState(null);
const [monthlyLimit, setMonthlyLimit] = useState("");
const [savingMonthlyLimit, setSavingMonthlyLimit] = useState(false);
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

      

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch categories"
        );
      }

      setCategories(data.categories);

data.categories.forEach((category) => {
  fetchMonthlyLimit(category.id);
});
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
    setDeleteError("");

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
    setDeleteError("");

  } catch (error) {
    console.error("Delete category error:", error);

    setDeleteError(
      error.message || "Failed to delete category"
    );

  } finally {
    setDeleting(false);
  }
};
const fetchMonthlyLimit = async (categoryId) => {
  try {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const response = await fetch(
      `http://localhost:5000/api/categories/${categoryId}/monthly-limit?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch monthly limit"
      );
    }

    setMonthlyLimits((prev) => ({
      ...prev,
      [categoryId]: data.monthlyLimit,
    }));
  } catch (error) {
    console.error("Fetch monthly limit error:", error);
  }
};
const displayedCategories = searchQuery.trim()
  ? categories.filter((category) =>
      category.name
        ?.toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    )
  : categories;
const handleSaveMonthlyLimit = async (e) => {
  e.preventDefault();

  if (!monthlyLimit || Number(monthlyLimit) <= 0) {
    return;
  }

  try {
    setSavingMonthlyLimit(true);
    setError("");

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const response = await fetch(
      `http://localhost:5000/api/categories/${monthlyLimitCategory.id}/monthly-limit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          year,
          month,
            limit_km: Number(monthlyLimit),
        }),
      }
    );

    const data = await response.json();


    if (!response.ok) {
      throw new Error(
        data.message || "Failed to save monthly limit"
      );
    }

    setMonthlyLimits((prev) => ({
      ...prev,
      [monthlyLimitCategory.id]: data.monthlyLimit,
    }));

    setMonthlyLimitCategory(null);
    setMonthlyLimit("");

  } catch (error) {
    console.error("Save monthly limit error:", error);
    setError(error.message);
  } finally {
    setSavingMonthlyLimit(false);
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
  displayedCategories.length === 0 && (
    <div className="categories-state">
      <h3>
        {searchQuery.trim()
          ? "No categories found"
          : "No categories yet"}
      </h3>

      <p>
        {searchQuery.trim()
          ? `No categories match "${searchQuery.trim()}".`
          : "Add your first vehicle category to get started."}
      </p>
    </div>
  )}

      {!loading &&
        !error &&
        categories.length > 0 && (
          <div className="categories-grid">

            {displayedCategories.map((category) => (
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
  onClick={() => {
  setDeleteError("");
  setDeletingCategory(category);
}}
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

<div className="category-monthly-limit">

 <div className="category-monthly-limit-info">
  <div className="category-monthly-limit-label">
    <Gauge size={15} />
    <span>Monthly Mileage Limit</span>
  </div>

  <strong>
    {monthlyLimits[category.id]
      ? `${Number(
          monthlyLimits[category.id].limit_km
        ).toLocaleString()} KM`
      : "Not set"}
  </strong>

  <small>
    {new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}
  </small>
</div>

  <button
    className="category-limit-button"
    onClick={() => {
      setMonthlyLimitCategory(category);

      setMonthlyLimit(
        monthlyLimits[category.id]?.  limit_km || ""
      );
    }}
  >
    {monthlyLimits[category.id]
      ? "Edit Limit"
      : "Set Limit"}
  </button>

</div>
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

        <h3>
          {deleteError
            ? "Cannot Delete Category"
            : "Delete Category?"}
        </h3>

        {deleteError ? (
          <p className="delete-modal-error">
            {deleteError}
          </p>
        ) : (
          <p>
            Are you sure you want to delete{" "}
            <strong>{deletingCategory.name}</strong>?
            This action cannot be undone.
          </p>
        )}

      </div>

      <div className="delete-modal-actions">

        {deleteError ? (

          <button
            type="button"
            className="delete-modal-confirm"
            onClick={() => {
              setDeleteError("");
              setDeletingCategory(null);
            }}
          >
            OK
          </button>

        ) : (

          <>
            <button
              type="button"
              className="delete-modal-cancel"
              onClick={() => {
                setDeleteError("");
                setDeletingCategory(null);
              }}
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
              {deleting
                ? "Deleting..."
                : "Delete Category"}
            </button>
          </>

        )}

      </div>

    </div>

  </div>
)}
{monthlyLimitCategory && (
  <div className="delete-modal-overlay">

    <div className="monthly-limit-modal">

      <div className="monthly-limit-modal-header">

        <div className="monthly-limit-modal-icon">
          <Gauge size={22} />
        </div>

        <div>
          <h3>Monthly Mileage Limit</h3>

          <p>
            Set the monthly KM limit for{" "}
            <strong>
              {monthlyLimitCategory.name}
            </strong>
          </p>
        </div>

      </div>

      <form onSubmit={handleSaveMonthlyLimit}>

        <div className="category-form-group">

          <label htmlFor="monthly-km-limit">
            KM Limit
          </label>

          <input
            id="monthly-km-limit"
            type="number"
            min="1"
            value={monthlyLimit}
            onChange={(e) =>
              setMonthlyLimit(e.target.value)
            }
            placeholder="e.g. 3000"
            disabled={savingMonthlyLimit}
          />

          <span className="monthly-limit-helper">
            This limit applies to the current month.
          </span>

        </div>

        <div className="category-form-actions">

          <button
            type="button"
            onClick={() => {
              setMonthlyLimitCategory(null);
              setMonthlyLimit("");
            }}
            disabled={savingMonthlyLimit}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              savingMonthlyLimit ||
              !monthlyLimit ||
              Number(monthlyLimit) <= 0
            }
          >
            {savingMonthlyLimit
              ? "Saving..."
              : "Save Limit"}
          </button>

        </div>

      </form>

    </div>

  </div>
)}
    </div>
   
  );
}

export default Categories;