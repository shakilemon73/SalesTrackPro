import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Smartphone, Tablet, Grid, Type, Move, Eye, Box } from 'lucide-react';

export default function MobileFrameworkDemo() {
  const [activeTab, setActiveTab] = useState('grid');

  const GridSystemDemo = () => (
    <div className="container">
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">12-Column Grid System</h3>
        </div>
        <div className="card-body">
          {/* Full width row */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="bg-primary text-white p-2 rounded text-center">col-12</div>
            </div>
          </div>
          
          {/* Half and half */}
          <div className="row mb-3">
            <div className="col-6">
              <div className="bg-secondary text-white p-2 rounded text-center">col-6</div>
            </div>
            <div className="col-6">
              <div className="bg-secondary text-white p-2 rounded text-center">col-6</div>
            </div>
          </div>
          
          {/* Responsive columns */}
          <div className="row mb-3">
            <div className="col-12 col-md-4">
              <div className="bg-success text-white p-2 rounded text-center">col-12 col-md-4</div>
            </div>
            <div className="col-12 col-md-8">
              <div className="bg-success text-white p-2 rounded text-center">col-12 col-md-8</div>
            </div>
          </div>
          
          {/* Three columns */}
          <div className="row mb-3">
            <div className="col-4">
              <div className="bg-warning text-white p-2 rounded text-center">col-4</div>
            </div>
            <div className="col-4">
              <div className="bg-warning text-white p-2 rounded text-center">col-4</div>
            </div>
            <div className="col-4">
              <div className="bg-warning text-white p-2 rounded text-center">col-4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FlexboxDemo = () => (
    <div className="container">
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Flexbox Utilities</h3>
        </div>
        <div className="card-body">
          {/* Justify Content */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Justify Content</h4>
            <div className="d-flex justify-content-between p-3 mb-2 bg-primary-soft rounded">
              <div className="bg-primary text-white px-2 py-1 rounded">1</div>
              <div className="bg-primary text-white px-2 py-1 rounded">2</div>
              <div className="bg-primary text-white px-2 py-1 rounded">3</div>
            </div>
            <div className="d-flex justify-content-center p-3 mb-2 bg-secondary-soft rounded">
              <div className="bg-secondary text-white px-2 py-1 rounded mr-2">Center</div>
            </div>
          </div>
          
          {/* Align Items */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Align Items</h4>
            <div className="d-flex align-items-center justify-content-around p-4 bg-success-soft rounded" style={{ height: '80px' }}>
              <div className="bg-success text-white px-2 py-1 rounded">Centered</div>
              <div className="bg-success text-white px-2 py-1 rounded">Items</div>
            </div>
          </div>
          
          {/* Flex Direction */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Flex Direction</h4>
            <div className="d-flex flex-column p-3 bg-warning-soft rounded">
              <div className="bg-warning text-white p-2 rounded mb-2">Column 1</div>
              <div className="bg-warning text-white p-2 rounded">Column 2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SpacingDemo = () => (
    <div className="container">
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Spacing Utilities</h3>
        </div>
        <div className="card-body">
          {/* Margins */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Margins (m-1 to m-5)</h4>
            <div className="bg-muted p-3 rounded">
              <div className="bg-primary text-white p-2 rounded m-1 d-inline-block">m-1</div>
              <div className="bg-primary text-white p-2 rounded m-2 d-inline-block">m-2</div>
              <div className="bg-primary text-white p-2 rounded m-3 d-inline-block">m-3</div>
            </div>
          </div>
          
          {/* Padding */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Padding (p-1 to p-5)</h4>
            <div className="row">
              <div className="col-4">
                <div className="bg-primary text-white p-1 rounded text-center mb-2">p-1</div>
              </div>
              <div className="col-4">
                <div className="bg-primary text-white p-3 rounded text-center mb-2">p-3</div>
              </div>
              <div className="col-4">
                <div className="bg-primary text-white p-5 rounded text-center mb-2">p-5</div>
              </div>
            </div>
          </div>
          
          {/* Directional Spacing */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Directional Spacing</h4>
            <div className="bg-secondary-soft p-3 rounded">
              <div className="bg-secondary text-white p-2 rounded mt-3 mb-2">mt-3 mb-2</div>
              <div className="bg-secondary text-white p-2 rounded ml-4">ml-4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ComponentsDemo = () => (
    <div className="container">
      {/* Buttons */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Touch-Optimized Buttons</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-6 col-md-3 mb-2">
              <button className="btn btn-primary w-100" data-testid="button-primary">Primary</button>
            </div>
            <div className="col-6 col-md-3 mb-2">
              <button className="btn btn-secondary w-100" data-testid="button-secondary">Secondary</button>
            </div>
            <div className="col-6 col-md-3 mb-2">
              <button className="btn btn-success w-100" data-testid="button-success">Success</button>
            </div>
            <div className="col-6 col-md-3 mb-2">
              <button className="btn btn-danger w-100" data-testid="button-danger">Danger</button>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-base font-weight-semibold mb-2">Button Sizes</h4>
            <button className="btn btn-primary btn-sm mr-2" data-testid="button-small">Small</button>
            <button className="btn btn-primary mr-2" data-testid="button-normal">Normal</button>
            <button className="btn btn-primary btn-lg" data-testid="button-large">Large</button>
          </div>
        </div>
      </div>

      {/* Form Controls */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Touch-Friendly Forms</h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label" htmlFor="demo-input">Label</label>
            <input 
              type="text" 
              className="form-control" 
              id="demo-input" 
              placeholder="Touch-optimized input"
              data-testid="input-demo"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="demo-select">Select</label>
            <select className="form-control" id="demo-select" data-testid="select-demo">
              <option>Choose option...</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="demo-textarea">Textarea</label>
            <textarea 
              className="form-control" 
              id="demo-textarea" 
              rows={3}
              placeholder="Touch-optimized textarea"
              data-testid="textarea-demo"
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Cards</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <div className="card">
                <div className="card-header">
                  Card Header
                </div>
                <div className="card-body">
                  <p className="mb-2">This is a card body with some content.</p>
                  <button className="btn btn-primary btn-sm" data-testid="card-button">Action</button>
                </div>
                <div className="card-footer text-muted">
                  Card Footer
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="font-weight-bold mb-2">Simple Card</h5>
                  <p className="text-muted mb-0">Card without header or footer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UtilitiesDemo = () => (
    <div className="container">
      {/* Display Utilities */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Display & Responsive Utilities</h3>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Responsive Display</h4>
            <div className="p-3 bg-primary-soft rounded">
              <div className="d-block d-md-none bg-primary text-white p-2 rounded mb-2">Visible on mobile only</div>
              <div className="d-none d-md-block bg-secondary text-white p-2 rounded mb-2">Visible on tablet+ only</div>
              <div className="d-block bg-success text-white p-2 rounded">Always visible</div>
            </div>
          </div>
          
          {/* Width & Height */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Width & Height</h4>
            <div className="mb-2">
              <div className="w-25 bg-primary text-white p-2 rounded mb-1">w-25</div>
              <div className="w-50 bg-primary text-white p-2 rounded mb-1">w-50</div>
              <div className="w-75 bg-primary text-white p-2 rounded mb-1">w-75</div>
              <div className="w-100 bg-primary text-white p-2 rounded">w-100</div>
            </div>
          </div>
          
          {/* Typography */}
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Typography</h4>
            <div className="text-left p-2 bg-muted rounded mb-2">text-left</div>
            <div className="text-center p-2 bg-muted rounded mb-2">text-center</div>
            <div className="text-right p-2 bg-muted rounded mb-2">text-right</div>
            
            <div className="mt-3">
              <p className="font-weight-light">font-weight-light</p>
              <p className="font-weight-normal">font-weight-normal</p>
              <p className="font-weight-bold">font-weight-bold</p>
            </div>
            
            <div className="mt-3">
              <p className="text-xs">text-xs - Extra small text</p>
              <p className="text-sm">text-sm - Small text</p>
              <p className="text-base">text-base - Base text</p>
              <p className="text-lg">text-lg - Large text</p>
              <p className="text-xl">text-xl - Extra large text</p>
            </div>
          </div>
        </div>
      </div>

      {/* Border Radius & Shadows */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Border Radius & Shadows</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-primary text-white p-3 rounded-0 text-center">rounded-0</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-primary text-white p-3 rounded text-center">rounded</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-primary text-white p-3 rounded-lg text-center">rounded-lg</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-primary text-white p-3 rounded-full text-center">rounded-full</div>
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-white p-3 shadow-sm rounded text-center">shadow-sm</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-white p-3 shadow rounded text-center">shadow</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-white p-3 shadow-md rounded text-center">shadow-md</div>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <div className="bg-white p-3 shadow-lg rounded text-center">shadow-lg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ResponsiveDemo = () => (
    <div className="container">
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="text-lg font-weight-bold mb-0">Responsive Breakpoints</h3>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Current Breakpoint Info</h4>
            <div className="p-3 bg-muted rounded">
              <p className="mb-2"><strong>Mobile-First Breakpoints:</strong></p>
              <ul className="mb-0 pl-4">
                <li>xs: 320px (iPhone 5/SE)</li>
                <li>sm: 375px (iPhone 6/7/8)</li>
                <li>md: 414px (iPhone Plus)</li>
                <li>lg: 480px (Small tablets)</li>
                <li>xl: 768px (iPad Portrait)</li>
                <li>xxl: 834px (iPad Pro 10.5")</li>
                <li>xxxl: 1024px (iPad Landscape)</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Responsive Grid Demo</h4>
            <div className="row">
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div className="bg-primary text-white p-3 rounded text-center">
                  12/6/4/3
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div className="bg-secondary text-white p-3 rounded text-center">
                  12/6/4/3
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div className="bg-success text-white p-3 rounded text-center">
                  12/6/4/3
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div className="bg-warning text-white p-3 rounded text-center">
                  12/6/4/3
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-base font-weight-semibold mb-2">Device-Specific Features</h4>
            <div className="bg-success-soft p-3 rounded">
              <p className="mb-2"><strong>iOS & Android Optimizations:</strong></p>
              <ul className="mb-0 pl-4">
                <li>44px minimum touch targets (iOS HIG)</li>
                <li>48px touch targets for Android Material</li>
                <li>iOS Safe Area support with env() variables</li>
                <li>Smooth scrolling behavior</li>
                <li>Touch-action optimization</li>
                <li>-webkit-tap-highlight-color: transparent</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'grid', label: 'Grid System', icon: Grid, component: GridSystemDemo },
    { id: 'flexbox', label: 'Flexbox', icon: Move, component: FlexboxDemo },
    { id: 'spacing', label: 'Spacing', icon: Box, component: SpacingDemo },
    { id: 'components', label: 'Components', icon: Smartphone, component: ComponentsDemo },
    { id: 'utilities', label: 'Utilities', icon: Type, component: UtilitiesDemo },
    { id: 'responsive', label: 'Responsive', icon: Tablet, component: ResponsiveDemo },
  ];

  return (
    <div className="min-h-screen bg-background-app">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-4">
            <div className="d-flex align-items-center">
              <Link href="/" data-testid="link-back">
                <button className="btn btn-secondary btn-sm mr-3" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </Link>
              <h1 className="text-xl font-weight-bold mb-0">Mobile Framework Demo</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="d-flex overflow-x-auto py-2" style={{ scrollSnapType: 'x mandatory' }}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`btn btn-sm mr-2 d-flex align-items-center flex-shrink-0 ${
                    activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id}`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <IconComponent className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-4">
        {tabs.find(tab => tab.id === activeTab)?.component()}
      </div>

      {/* Framework Info Footer */}
      <div className="bg-white mt-5 border-t">
        <div className="container py-4">
          <div className="text-center text-muted">
            <p className="mb-2"><strong>Mobile-First Responsive CSS Framework</strong></p>
            <p className="text-sm mb-0">Optimized for Android & iOS • Touch-friendly • Accessible • Production-ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}