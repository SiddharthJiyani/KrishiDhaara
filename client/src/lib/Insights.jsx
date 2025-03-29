export const formatInsights = (data) => {
  try {
    // First check if data is already a string (likely markdown)
    if (typeof data === "string") {
      // Try to parse as JSON to see if it's a JSON string
      try {
        const parsed = JSON.parse(data);
        // If we got here, it was valid JSON so we need to format it
        return formatJsonToMarkdown(parsed);
      } catch (e) {
        // If parsing failed, it's probably already markdown
        return data;
      }
    } else if (typeof data === "object") {
      // It's already a parsed object
      return formatJsonToMarkdown(data);
    }
    
    // Default return the original data
    return data;
  } catch (error) {
    console.error("Error formatting insights:", error);
    return data; // Return original data if formatting fails
  }
};

// Helper function to convert JSON to markdown if needed
const formatJsonToMarkdown = (insights) => {
  let markdown = "";
  
  // Process each key dynamically
  for (const key in insights) {
    // Skip null or undefined values
    if (insights[key] == null) continue;
    
    // Convert key to title case for section header
    const sectionTitle = key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/_/g, ' '); // Replace underscores with spaces
    
    markdown += `## ${sectionTitle}\n`;
    
    // Handle different value types
    if (typeof insights[key] === "string") {
      // Handle string values
      markdown += `${insights[key]}\n\n`;
    } else if (Array.isArray(insights[key])) {
      // Handle arrays
      insights[key].forEach(item => {
        if (typeof item === "string") {
          markdown += `- ${item}\n`;
        } else if (typeof item === "object" && item !== null) {
          // Handle objects within arrays (like recommendations)
          const itemKeys = Object.keys(item);
          // Look for primary content keys
          const primaryKeys = ["advice", "recommendation", "issue", "point"];
          const primaryKey = itemKeys.find(k => primaryKeys.includes(k.toLowerCase())) || itemKeys[0];
          
          markdown += `- **${item[primaryKey]}**\n`;
          
          // Add supporting details
          itemKeys.forEach(itemKey => {
            if (itemKey !== primaryKey && typeof item[itemKey] === "string") {
              markdown += `  *${itemKey}*: ${item[itemKey]}\n`;
            }
          });
        }
      });
      markdown += "\n";
    } else if (typeof insights[key] === "object") {
      // Handle nested objects
      for (const subKey in insights[key]) {
        if (insights[key][subKey] == null) continue;
        
        // Create subheading
        const subHeading = subKey
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/_/g, ' ');
        
        markdown += `### ${subHeading}\n`;
        
        // Handle different value types for nested objects
        if (typeof insights[key][subKey] === "string") {
          markdown += `${insights[key][subKey]}\n\n`;
        } else if (Array.isArray(insights[key][subKey])) {
          insights[key][subKey].forEach(item => {
            if (typeof item === "string") {
              markdown += `- ${item}\n`;
            } else if (typeof item === "object" && item !== null) {
              // Try to extract the most important information
              const content = Object.values(item).join(" - ");
              markdown += `- ${content}\n`;
            }
          });
          markdown += "\n";
        } else if (typeof insights[key][subKey] === "object" && insights[key][subKey] !== null) {
          // For deeply nested objects, flatten to key-value pairs
          Object.entries(insights[key][subKey]).forEach(([nestedKey, nestedValue]) => {
            if (typeof nestedValue === "string") {
              markdown += `**${nestedKey}**: ${nestedValue}\n\n`;
            }
          });
        }
      }
    }
  }
  
  return markdown.trim();
};