// src/lib/shopify.ts
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  price: string;
  currencyCode: string;
  imageUrl: string;
  variantId: string;
  checkoutUrl: string;
}

const STOREFRONT_QUERY = `
  query GetStorefrontProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ADMIN_QUERY = `
  query GetAdminProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProducts(domain?: string, token?: string, limit: number = 20): Promise<ShopifyProduct[]> {
  const isMock = !domain || !token;
  const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'mock.shop';
  const isAdminToken = Boolean(token && (token.startsWith('shpat_') || token.startsWith('shpca_')));

  let endpoint = 'https://mock.shop/api';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isMock) {
    if (isAdminToken) {
      endpoint = `https://${cleanDomain}/admin/api/2024-07/graphql.json`;
      headers['X-Shopify-Access-Token'] = token!;
    } else {
      endpoint = `https://${cleanDomain}/api/2024-07/graphql.json`;
      headers['X-Shopify-Storefront-Access-Token'] = token!;
    }
  }

  const query = isAdminToken ? ADMIN_QUERY : STOREFRONT_QUERY;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: { first: limit }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'Error en GraphQL de Shopify');
  }

  const edges = json.data?.products?.edges || [];
  return edges.map(({ node }: any) => {
    const firstVariant = node.variants?.edges?.[0]?.node;
    const variantGid = firstVariant?.id || '';
    // Extraer ID numérico de variant GID tipo gid://shopify/ProductVariant/12345678
    const variantNumericId = variantGid.split('/').pop() || '';
    const checkoutUrl = variantNumericId
      ? `https://${cleanDomain}/cart/${variantNumericId}:1`
      : `https://${cleanDomain}/products/${node.handle}`;

    let price = '0';
    let currencyCode = 'PEN';

    if (isAdminToken) {
      price = firstVariant?.price || '0';
    } else {
      price = node.priceRange?.minVariantPrice?.amount || firstVariant?.price?.amount || '0';
      currencyCode = node.priceRange?.minVariantPrice?.currencyCode || 'PEN';
    }

    return {
      id: node.handle || node.id,
      title: node.title,
      handle: node.handle,
      description: node.description || '',
      availableForSale: node.availableForSale !== undefined ? node.availableForSale : true,
      price,
      currencyCode,
      imageUrl: node.featuredImage?.url || '/images/hero-bg.jpg',
      variantId: variantGid,
      checkoutUrl,
    };
  });
}
