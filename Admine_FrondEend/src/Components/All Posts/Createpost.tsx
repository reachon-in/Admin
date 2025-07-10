import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Css/Createpost.module.css";
import { postService } from "../../../services/api";

const Createpost = () => {
  const navigate = useNavigate();
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postArea, setPostArea] = useState("");
  const [layout, setLayout] = useState("default");
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [layoutImage, setLayoutImage] = useState<File | null>(null);
  const [layoutPreview, setLayoutPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [editorContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLayoutImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLayoutPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailImage(null);
    setThumbnailPreview(null);
  };

  const removeLayout = () => {
    setLayoutImage(null);
    setLayoutPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !postArea) {
      alert("Please fill in title, content, and select a post area");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content); // Use separate content field
      formData.append("tags", JSON.stringify(tags)); // Send tags as JSON array
      formData.append("layout", layout);
      formData.append("postArea", postArea);
      formData.append("adsEnabled", adsEnabled ? "true" : "false");

      if (thumbnailImage) {
        formData.append("thumbnail", thumbnailImage);
      }
      if (layoutImage) {
        formData.append("layoutImage", layoutImage);
      }
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          formData.append("pdfUrl", file);
        }
      }

      console.log("Submitting form data:", {
        title,
        content,
        tags: JSON.stringify(tags),
        layout,
        postArea,
        adsEnabled: adsEnabled ? "true" : "false",
        thumbnailImage: thumbnailImage?.name,
        layoutImage: layoutImage?.name,
        uploadedFiles: uploadedFiles.map(f => f.name)
      });

      await postService.createPost(formData);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        navigate("/post");
      }, 2000);
    } catch (error: any) {
      console.error("Post submission failed:", error);
      
      let errorMessage = "Failed to submit post. Please try again.";
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = "Bad Request: Please check all required fields are filled correctly.";
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized: Please log in again.";
        } else if (error.response.status === 404) {
          errorMessage = "Endpoint not found: Please check the API URL.";
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const isFormValid = (): boolean => {
    const hasTitle = title.trim() !== "";
    const hasContent = content.trim() !== "";
    const hasPostArea = postArea.trim() !== "";
    
    return hasTitle && hasContent && hasPostArea;
  };

  const testApiConnection = async () => {
    try {
      console.log("Testing API connection...");
      const token = localStorage.getItem("accessToken");
      console.log("Current token:", token ? "Present" : "Missing");
      if (token) {
        console.log("Token preview:", token.substring(0, 20) + "...");
      }
      await postService.testConnection();
      alert("API connection successful!");
    } catch (error: any) {
      console.error("API test failed:", error);
      alert("API connection failed. Check console for details.");
    }
  };

  const testMinimalPost = async () => {
    try {
      console.log("Testing minimal post creation...");
      await postService.testMinimalPost();
      alert("Minimal post test successful!");
    } catch (error: any) {
      console.error("Minimal post test failed:", error);
      alert("Minimal post test failed. Check console for details.");
    }
  };

  const testAlternativeFields = async () => {
    try {
      console.log("Testing with alternative field names...");
      await postService.testAlternativeFields();
      alert("Alternative fields test successful!");
    } catch (error: any) {
      console.error("Alternative fields test failed:", error);
      alert("Alternative fields test failed. Check console for details.");
    }
  };

  const testExactFormData = async () => {
    try {
      console.log("Testing with exact form data structure...");
      await postService.testExactFormData();
      alert("Exact form data test successful!");
    } catch (error: any) {
      console.error("Exact form data test failed:", error);
      alert("Exact form data test failed. Check console for details.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Create Post</h1>
        <div className={styles.topBarActions}>
          <button
            className={styles.cancelBtn}
            type="button"
            onClick={() => navigate(-1)}>
            X Cancel
          </button>
          <button
            type="button"
            onClick={testApiConnection}
            style={{
              background: "#0066ff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              marginLeft: "12px",
              cursor: "pointer"
            }}>
            Test API
          </button>
          <button
            type="button"
            onClick={testMinimalPost}
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              marginLeft: "12px",
              cursor: "pointer"
            }}>
            Test Minimal Post
          </button>
          <button
            type="button"
            onClick={testAlternativeFields}
            style={{
              background: "#ffc107",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              marginLeft: "12px",
              cursor: "pointer"
            }}>
            Test Alt Fields
          </button>
          <button
            type="button"
            onClick={testExactFormData}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              marginLeft: "12px",
              cursor: "pointer"
            }}>
            Test Exact Form
          </button>
        </div>
      </div>
      <form className={styles.mainContent} onSubmit={handleSubmit}>
        <div className={styles.leftCol}>
          <div className={styles.sectionTitle}>Post Content</div>
          <div className={styles.titleSection}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              placeholder="Enter post title..."
              style={{ background: "rgba(255,255,255,0.04)" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.contentSection}>
            <label className={styles.label}>Content</label>
            <textarea
              className={styles.input}
              placeholder="Enter post content..."
              style={{ 
                background: "rgba(255,255,255,0.04)",
                minHeight: "120px",
                resize: "vertical"
              }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className={styles.tagsSection}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagsContainer}>
              <div className={styles.tagsList}>
                {tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={styles.removeTag}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
                className={styles.tagInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Thumbnail Image</label>
            <div className={styles.imageUploadContainer}>
              {thumbnailPreview ? (
                <div className={styles.imagePreviewContainer}>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className={styles.removeImageBtn}>
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className={styles.fileInput}
                    id="thumbnailUpload"
                  />
                  <label
                    htmlFor="thumbnailUpload"
                    className={styles.uploadLabel}>
                    <span className={styles.uploadIcon}>+</span>
                    <span>Upload Thumbnail Image</span>
                    <span className={styles.uploadHint}>
                      Click or drag image here
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Editor section is commented out as requested */}

          <div className={styles.inputGroup}>
            <div className={styles.layoutSection}>
              <label className={styles.label}>Select Layout</label>
              <select
                className={styles.input}
                style={{ background: "rgba(255,255,255,0.04)" }}
                value={layout}
                onChange={(e) => setLayout(e.target.value)}>
                <option value="default">Default</option>
                <option value="upload">Upload Layout</option>
              </select>
            </div>
            {layout === "upload" && (
              <div className={styles.imageUploadContainer}>
                {layoutPreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img
                      src={layoutPreview}
                      alt="Layout Preview"
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      onClick={removeLayout}
                      className={styles.removeImageBtn}>
                      Remove Layout
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLayoutChange}
                      className={styles.fileInput}
                      id="layoutUpload"
                    />
                    <label
                      htmlFor="layoutUpload"
                      className={styles.uploadLabel}>
                      <span className={styles.uploadIcon}>+</span>
                      <span>Upload Layout Image</span>
                      <span className={styles.uploadHint}>
                        Click or drag image here
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className={styles.postBtn}
            disabled={!isFormValid()}
            style={{
              background: isFormValid() ? "#0066ff" : "#222",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "16px 0",
              fontSize: "1.2rem",
              fontWeight: 700,
              marginTop: 32,
              width: 200,
              alignSelf: "center",
              cursor: isFormValid() ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              opacity: isFormValid() ? 1 : 0.6,
              display: "block",
            }}>
            Post
          </button>
          {submitted && (
            <div
              style={{
                color: "#2ecc40",
                textAlign: "center",
                marginTop: 16,
                fontWeight: 600,
              }}>
              Submitted successfully
            </div>
          )}
        </div>
        <div className={styles.rightCol}>
          <div className={styles.sectionTitle}>Publish Settings</div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Post Area</label>
            <select
              className={styles.input}
              style={{ background: "rgba(255,255,255,0.04)" }}
              value={postArea}
              onChange={(e) => setPostArea(e.target.value)}>
              <option value="">Select an area</option>
              <option>Science Fiction</option>
              <option>History</option>
              <option>Politics</option>
              <option>Technology</option>
              <option>Health</option>
              <option>Business</option>
              <option>Entertainment</option>
              <option>Sports</option>
              <option>Anime</option>
              <option>Manga</option>
              <option>Movies</option>
              <option>TV Shows</option>
              <option>Podcast</option>
              <option>Books</option>
              <option>Other</option>
            </select>
          </div>
          <div className={styles.adBox}>
            <div className={styles.adToggleRow}>
              <span className={styles.adLabel}>Show ads on this post</span>
              <span
                className={`${styles.toggleSwitch} ${
                  adsEnabled ? styles.on : ""
                }`}
                onClick={() => setAdsEnabled((v) => !v)}
                role="button"
                tabIndex={0}
                aria-pressed={adsEnabled}
                style={{ marginLeft: 12 }}></span>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statsTitle}>Post Statistics</div>
            <div className={styles.statsItem}>
              Word count:{" "}
              <span>
                {
                  (editorContent
                    .replace(/<[^>]*>/g, "")
                    .trim()
                    .split(/\s+/) || []).filter(Boolean).length
                }
              </span>
            </div>
            <div className={styles.statsItem}>
              Characters:{" "}
              <span>{editorContent.replace(/<[^>]*>/g, "").length}</span>
            </div>
            <div className={styles.statsItem}>
              Reading Time:{" "}
              <span>
                {Math.ceil(
                  (editorContent
                    .replace(/<[^>]*>/g, "")
                    .trim()
                    .split(/\s+/) || []).filter(Boolean).length / 200
                )}{" "}
                Min
              </span>
            </div>
          </div>

          <div className={styles.documentUploadBox}>
            <div className={styles.statsTitle}>Upload Container</div>
            <div className={styles.documentUploadContainer}>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setUploadedFiles(files);
                }}
                className={styles.fileInput}
                id="documentUpload"
              />
              <label
                htmlFor="documentUpload"
                className={styles.documentUploadLabel}>
                <span className={styles.uploadIcon}>+</span>
                <span>Upload Supporting Documents</span>
                <span className={styles.uploadHint}>
                  Supported formats: PDF, PNG, JPG, DOC
                </span>
                {uploadedFiles.length > 0 && (
                  <span className={styles.uploadCount}>
                    {uploadedFiles.length} file(s) selected
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Createpost;
