import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  
  // Default avatar gradients
  private readonly gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ];

  /**
   * Get the initial letter from a name
   */
  getInitial(name: string): string {
    if (!name || name.trim().length === 0) {
      return '?';
    }
    return name.trim().charAt(0).toUpperCase();
  }

  /**
   * Get a consistent gradient background based on the name
   */
  getGradientBackground(name: string): string {
    if (!name) return this.gradients[0];
    
    // Generate a consistent index based on the first character of the name
    const charCode = name.charCodeAt(0);
    const index = charCode % this.gradients.length;
    return this.gradients[index];
  }

  /**
   * Get appropriate font size based on avatar size
   */
  getFontSize(size: number): string {
    if (size <= 24) return '10px';
    if (size <= 32) return '12px';
    if (size <= 48) return '16px';
    if (size <= 64) return '20px';
    if (size <= 80) return '24px';
    return '28px';
  }

  /**
   * Check if a photo URL is valid
   */
  isValidPhoto(photo: string | null | undefined): boolean {
    if (!photo || photo.trim().length === 0) {
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(photo);
      return true;
    } catch {
      // Check if it's a base64 image
      return photo.startsWith('data:image/');
    }
  }

  /**
   * Get default avatar styles for inline use
   */
  getDefaultAvatarStyles(name: string, size: number): any {
    return {
      'background': this.getGradientBackground(name),
      'width': `${size}px`,
      'height': `${size}px`,
      'font-size': this.getFontSize(size),
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'border-radius': '50%',
      'color': 'white',
      'font-weight': '500'
    };
  }

  /**
   * Generate a unique color for a user based on their name
   */
  getUserColor(name: string): string {
    if (!name) return '#667eea';
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert hash to a color
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padEnd(6, '0')}`;
  }
}


