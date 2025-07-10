import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import truncate from "truncate-html";

import styles from "./Css/AllPost.module.css";
import { postService, fastRService } from "../../../services/api";

interface CombinedPost {
  _id: string;
  title: string;
  content: string;
  contentType: string;
  tags: string[];
  createdAt: string | Date;
  isActive: boolean;
  source: "Post" | "FastR";
}

interface HtmlPreviewProps {
  html: string;
  limit?: number;
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({
  html,
  limit = 100,
}) => {
  // Handle undefined/null html values
  if (!html || typeof html !== 'string') {
    return <div>No content available</div>;
  }

  try {
    const truncated = truncate(html, limit, { reserveLastWord: true });
    const plainHtml = html.replace(/<[^>]+>/g, "");
    const plainTruncated = truncated.replace(/<[^>]+>/g, "");
    
    const needsEllipsis = plainHtml.length > plainTruncated.length;
    const finalHtml = needsEllipsis ? truncated + "…" : truncated;

    return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
  } catch (error) {
    console.error('Error in HtmlPreview:', error);
    // Fallback to plain text if HTML processing fails
    return <div>{html.replace(/<[^>]+>/g, "").substring(0, limit)}...</div>;
  }
};

const AllPost = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [posts, setPosts] = useState<CombinedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showNewPostMenu, setShowNewPostMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postData = await postService.getAllPosts();
        const fastRData = await fastRService.getAllFastRs();

        const normalizedPosts = Array.isArray(postData)
          ? postData.map((post: any) => ({
              ...post,
              content: post.content || '',
              source: "Post",
              isActive: post.isActive === "Published" || post.isActive === true,
              createdAt: new Date(post.createdAt),
            }))
          : [];

        const normalizedFastRs = Array.isArray(fastRData)
          ? fastRData.map((fastR: any) => ({
              _id: fastR._id,
              title: fastR.title || 'Untitled',
              content: fastR.content || '',
              tags: fastR.tags || [],
              contentType: "Audio",
              isActive: fastR.isActive,
              createdAt: new Date(fastR.createdAt),
              source: "FastR",
            }))
          : [];

        const merged = [...normalizedPosts, ...normalizedFastRs];
        merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

        setPosts(merged);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts or FastRs");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (statusFilter === "All Status") return true;
    if (statusFilter === "Published") return post.isActive;
    if (statusFilter === "Blocked") return !post.isActive;
    return true;
  });

  const handleNewPostClick = () => setShowNewPostMenu((prev) => !prev);

  const handleOptionClick = (option: string) => {
    navigate(`${pathname}/${option.toLowerCase()}`);
    setShowNewPostMenu(false);
  };

  const toggleMenu = (postId: string) => {
    setActiveMenuId((prev) => (prev === postId ? null : postId));
  };

  const handleMenuAction = async (
    action: "delete" | "hide" | "about",
    postId: string,
    source: "Post" | "FastR"
  ) => {
    try {
      if (action === "delete") {
        if (source === "Post") {
          await postService.deletePost(postId);
        } else {
          await fastRService.deleteFastR(postId);
        }
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } else if (action === "hide") {
        if (source === "Post") {
          await postService.makeBlockedPost(postId);
        } else {
          await fastRService.makeBlockedFastR(postId);
        }
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, isActive: false } : p
          )
        );
      } else if (action === "about") {
        console.log("About post:", postId);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Failed to ${action} ${source.toLowerCase()}`);
    } finally {
      setActiveMenuId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>All Posts</h1>
          <div className={styles.subtitle}>Manage and organize your content</div>
        </div>
        <div className={styles.newPostContainer}>
          <button className={styles.newPostBtn} onClick={handleNewPostClick}>
            + New Post
          </button>
          {showNewPostMenu && (
            <div className={styles.newPostMenu}>
              <button
                className={styles.menuOption}
                onClick={() => handleOptionClick("createpost")}
              >
                Content
              </button>
              <button
                className={styles.menuOption}
                onClick={() => handleOptionClick("firstr")}
              >
                FirstR
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.filterRow}>
        <select
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Published</option>
          <option>Blocked</option>
        </select>
      </div>

      <div className={styles.postsList}>
        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : (
          filteredPosts.map((post) => (
            <div className={styles.postCard} key={post._id}>
              <div className={styles.postHeader}>
                <span className={styles.postTitle}>{post.title}</span>
                <div className={styles.postActions}>
                  <span
                    className={
                      post.isActive ? styles.greenBadge : styles.redBadge
                    }
                  >
                    {post.isActive ? "Published" : "Blocked"}
                  </span>
                  <div className={styles.menuContainer}>
                    <button
                      className={styles.menuButton}
                      onClick={() => toggleMenu(post._id)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="6" r="2" fill="currentColor" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <circle cx="12" cy="18" r="2" fill="currentColor" />
                      </svg>
                    </button>
                    {activeMenuId === post._id && (
                      <div className={styles.menu}>
                        {(["delete", "hide", "about"] as const).map((action) => (
                          <button
                            key={action}
                            className={styles.menuItem}
                            onClick={() =>
                              handleMenuAction(action, post._id, post.source)
                            }
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.postDescription}>
                <HtmlPreview html={post.content} limit={100} />
              </div>

              <div className={styles.postMeta}>
                <div className={styles.postMetaTop}>
                  <span className={styles.contentType}>{post.source}</span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div className={styles.tags}>
                  {post.tags.map((tag) => `#${tag}`).join(" ")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default AllPost;
